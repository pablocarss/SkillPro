import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST - Marcar aula como concluída
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ treinamentoId: string; lessonId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { treinamentoId, lessonId } = await params;

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

    // Criar ou atualizar progresso
    const progress = await prisma.trainingLessonProgress.upsert({
      where: {
        userlId_lessonId: {
          userlId: session.user.id,
          lessonId: lessonId,
        },
      },
      update: {
        completed: true,
        completedAt: new Date(),
      },
      create: {
        userlId: session.user.id,
        lessonId: lessonId,
        completed: true,
        completedAt: new Date(),
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error("Erro ao marcar aula como concluída:", error);
    return NextResponse.json(
      { error: "Erro ao marcar aula como concluída" },
      { status: 500 }
    );
  }
}
