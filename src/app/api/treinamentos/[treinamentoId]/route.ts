import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Buscar treinamento completo para funcionário
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ treinamentoId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { treinamentoId } = await params;

    // Verificar se o usuário está matriculado
    const enrollment = await prisma.trainingEnrollment.findUnique({
      where: {
        userId_trainingId: {
          userId: session.user.id,
          trainingId: treinamentoId,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Você não está matriculado neste treinamento" },
        { status: 403 }
      );
    }

    // Buscar treinamento com módulos e aulas
    const training = await prisma.training.findUnique({
      where: { id: treinamentoId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        modules: {
          include: {
            lessons: {
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
        finalExam: {
          include: {
            questions: {
              include: {
                answers: true,
              },
              orderBy: { order: "asc" },
            },
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

    // Buscar progresso do usuário
    const lessonProgress = await prisma.trainingLessonProgress.findMany({
      where: {
        userlId: session.user.id,
        lesson: {
          module: {
            trainingId: treinamentoId,
          },
        },
      },
    });

    // Verificar se passou na prova final
    const examAttempt = await prisma.trainingExamAttempt.findFirst({
      where: {
        userId: session.user.id,
        exam: {
          trainingId: treinamentoId,
        },
        passed: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Verificar se tem certificado
    const certificate = await prisma.trainingCertificate.findUnique({
      where: {
        userId_trainingId: {
          userId: session.user.id,
          trainingId: treinamentoId,
        },
      },
    });

    // Mapear progresso para as aulas
    const progressMap = new Map(
      lessonProgress.map((p) => [p.lessonId, p.completed])
    );

    const modulesWithProgress = training.modules.map((module) => ({
      ...module,
      lessons: module.lessons.map((lesson) => ({
        ...lesson,
        completed: progressMap.get(lesson.id) || false,
      })),
    }));

    const totalLessons = training.modules.reduce(
      (acc, m) => acc + m.lessons.length,
      0
    );
    const completedLessons = lessonProgress.filter((p) => p.completed).length;

    return NextResponse.json({
      ...training,
      modules: modulesWithProgress,
      enrollment,
      progress: {
        total: totalLessons,
        completed: completedLessons,
        percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
      },
      examPassed: !!examAttempt,
      examScore: examAttempt?.score,
      hasCertificate: !!certificate,
      certificateId: certificate?.id,
    });
  } catch (error) {
    console.error("Erro ao buscar treinamento:", error);
    return NextResponse.json(
      { error: "Erro ao buscar treinamento" },
      { status: 500 }
    );
  }
}
