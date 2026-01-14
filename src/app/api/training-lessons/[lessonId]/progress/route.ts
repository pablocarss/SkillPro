import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

// POST - Marcar aula como concluída
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const user = await requireAuth();
    const { lessonId } = await params;
    const { completed } = await request.json();

    // Verificar se a aula existe
    const lesson = await prisma.trainingLesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            training: true,
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Verificar se o usuário está matriculado no treinamento
    const enrollment = await prisma.trainingEnrollment.findFirst({
      where: {
        userId: user.id,
        trainingId: lesson.module.trainingId,
      },
    });

    if (user.role !== "ADMIN" && !enrollment) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Criar ou atualizar o progresso
    const progress = await prisma.trainingLessonProgress.upsert({
      where: {
        userlId_lessonId: {
          userlId: user.id,
          lessonId,
        },
      },
      update: {
        completed,
        completedAt: completed ? new Date() : null,
      },
      create: {
        userlId: user.id,
        lessonId,
        completed,
        completedAt: completed ? new Date() : null,
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error("Error updating training lesson progress:", error);
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
}
