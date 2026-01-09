import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

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

    const { trainingId } = await req.json();

    if (!trainingId) {
      return NextResponse.json(
        { error: "ID do treinamento é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se o usuário está matriculado
    const enrollment = await prisma.trainingEnrollment.findUnique({
      where: {
        userId_trainingId: {
          userId: session.user.id,
          trainingId,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Você não está matriculado neste treinamento" },
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
        userlId: session.user.id,
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
        { error: "Você precisa completar todas as aulas para obter o certificado" },
        { status: 400 }
      );
    }

    // Verificar se já tem certificado
    const existingCertificate = await prisma.trainingCertificate.findUnique({
      where: {
        userId_trainingId: {
          userId: session.user.id,
          trainingId,
        },
      },
    });

    if (existingCertificate) {
      return NextResponse.json(existingCertificate);
    }

    // Buscar melhor nota da prova (se houver)
    const bestExamAttempt = await prisma.trainingExamAttempt.findFirst({
      where: {
        userId: session.user.id,
        exam: {
          trainingId,
        },
        passed: true,
      },
      orderBy: { score: "desc" },
    });

    // Calcular nota final (100% se não tiver prova, ou a nota da prova)
    const finalScore = bestExamAttempt?.score || 100;

    // Gerar hash único para o certificado
    const certificateHash = crypto
      .createHash("sha256")
      .update(`${session.user.id}-${trainingId}-${Date.now()}`)
      .digest("hex")
      .substring(0, 16)
      .toUpperCase();

    // Criar certificado
    const certificate = await prisma.trainingCertificate.create({
      data: {
        userId: session.user.id,
        trainingId,
        createdById: session.user.id,
        finalScore,
        certificateHash,
        digitalSignature: crypto
          .createHash("sha512")
          .update(`${certificateHash}-skillpro-training`)
          .digest("hex"),
      },
      include: {
        training: {
          include: {
            company: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Atualizar enrollment como concluído
    await prisma.trainingEnrollment.update({
      where: {
        userId_trainingId: {
          userId: session.user.id,
          trainingId,
        },
      },
      data: {
        completedAt: new Date(),
      },
    });

    return NextResponse.json(certificate, { status: 201 });
  } catch (error) {
    console.error("Erro ao gerar certificado:", error);
    return NextResponse.json(
      { error: "Erro ao gerar certificado" },
      { status: 500 }
    );
  }
}
