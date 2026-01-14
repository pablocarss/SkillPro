import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  generateTrainingCertificate,
  canGenerateTrainingCertificate,
} from "@/lib/training-certificate-generator";

// GET - Verificar se pode gerar certificado
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const trainingId = searchParams.get("trainingId");
    const userId = searchParams.get("userId") || session.user.id;

    if (!trainingId) {
      return NextResponse.json(
        { error: "trainingId é obrigatório" },
        { status: 400 }
      );
    }

    // Only admin can check for other users
    if (userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const result = await canGenerateTrainingCertificate(userId, trainingId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error checking certificate eligibility:", error);
    return NextResponse.json(
      { error: "Erro ao verificar elegibilidade" },
      { status: 500 }
    );
  }
}

// POST - Gerar certificado de treinamento
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { trainingId, userId: requestedUserId } = await req.json();

    if (!trainingId) {
      return NextResponse.json(
        { error: "ID do treinamento é obrigatório" },
        { status: 400 }
      );
    }

    // Use provided userId or session user
    const targetUserId = requestedUserId || session.user.id;

    // Only admin can generate for other users
    if (targetUserId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    // Verificar se o usuário está matriculado
    const enrollment = await prisma.trainingEnrollment.findUnique({
      where: {
        userId_trainingId: {
          userId: targetUserId,
          trainingId,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Usuário não está matriculado neste treinamento" },
        { status: 403 }
      );
    }

    // Verificar se completou todas as aulas
    const training = await prisma.training.findUnique({
      where: { id: trainingId },
      include: {
        modules: {
          include: {
            lessons: { select: { id: true } },
          },
        },
      },
    });

    if (!training) {
      return NextResponse.json(
        { error: "Treinamento não encontrado" },
        { status: 404 }
      );
    }

    const totalLessons = training.modules.reduce(
      (acc, m) => acc + m.lessons.length,
      0
    );

    const completedLessons = await prisma.trainingLessonProgress.count({
      where: {
        userlId: targetUserId,
        lesson: {
          module: {
            trainingId,
          },
        },
        completed: true,
      },
    });

    if (completedLessons < totalLessons) {
      return NextResponse.json(
        { error: "É preciso completar todas as aulas para obter o certificado" },
        { status: 400 }
      );
    }

    // Verificar se passou na prova final (se existir)
    const finalExam = await prisma.trainingFinalExam.findUnique({
      where: { trainingId },
    });

    if (finalExam) {
      const passedExam = await prisma.trainingExamAttempt.findFirst({
        where: {
          userId: targetUserId,
          examId: finalExam.id,
          passed: true,
        },
      });

      if (!passedExam) {
        return NextResponse.json(
          { error: "É preciso passar na prova final para obter o certificado" },
          { status: 400 }
        );
      }
    }

    // Gerar certificado usando o gerador completo (com PDF)
    const result = await generateTrainingCertificate({
      userId: targetUserId,
      trainingId,
      createdById: session.user.id,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result.certificate, { status: 201 });
  } catch (error) {
    console.error("Erro ao gerar certificado:", error);
    return NextResponse.json(
      { error: "Erro ao gerar certificado" },
      { status: 500 }
    );
  }
}
