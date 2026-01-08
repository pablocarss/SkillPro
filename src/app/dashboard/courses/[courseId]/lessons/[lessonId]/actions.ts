"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

export async function markLessonComplete(lessonId: string, courseId: string) {
  const user = await requireAuth();

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      studentId: user.id,
      courseId,
      status: "APPROVED",
    },
  });

  if (!enrollment) {
    throw new Error("Você não está matriculado neste curso");
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: true,
    },
  });

  if (!lesson || lesson.module.courseId !== courseId) {
    throw new Error("Aula não encontrada");
  }

  await prisma.lessonProgress.upsert({
    where: {
      studentId_lessonId: {
        studentId: user.id,
        lessonId,
      },
    },
    update: {
      completed: true,
      completedAt: new Date(),
    },
    create: {
      studentId: user.id,
      lessonId,
      completed: true,
      completedAt: new Date(),
    },
  });

  revalidatePath(`/dashboard/courses/${courseId}`);
  revalidatePath(`/dashboard/courses/${courseId}/lessons/${lessonId}`);

  return { success: true };
}
