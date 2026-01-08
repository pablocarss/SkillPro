import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CompleteLessonButton } from "./complete-lesson-button";

export default async function LessonViewPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const user = await requireAuth();
  const { courseId, lessonId } = await params;

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      studentId: user.id,
      courseId,
      status: "APPROVED",
    },
  });

  if (!enrollment) {
    redirect("/dashboard/courses");
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          course: true,
        },
      },
      quizzes: {
        include: {
          _count: {
            select: { questions: true },
          },
        },
      },
      progress: {
        where: {
          studentId: user.id,
        },
      },
    },
  });

  if (!lesson || lesson.module.courseId !== courseId) {
    redirect(`/dashboard/courses/${courseId}`);
  }

  const quizAttempts = await prisma.studentQuizAttempt.findMany({
    where: {
      studentId: user.id,
      quiz: {
        lessonId,
      },
    },
  });

  const isCompleted = lesson.progress.length > 0 && lesson.progress[0].completed;

  return (
    <div>
      <div className="mb-8">
        <Link
          href={`/dashboard/courses/${courseId}`}
          className="text-sm text-gray-600 hover:text-primary"
        >
          ← Voltar para o Curso
        </Link>
        <div className="mt-2 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{lesson.title}</h1>
            {lesson.description && <p className="text-gray-600">{lesson.description}</p>}
          </div>
          <CompleteLessonButton
            lessonId={lessonId}
            courseId={courseId}
            isCompleted={isCompleted}
          />
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Conteúdo da Aula</CardTitle>
          </CardHeader>
          <CardContent>
            {lesson.videoUrl && (
              <div className="mb-6 aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
                <video
                  src={lesson.videoUrl}
                  className="h-full w-full"
                  controls
                  title={lesson.title}
                />
              </div>
            )}
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap">{lesson.content}</p>
            </div>
          </CardContent>
        </Card>

        {lesson.quizzes.length > 0 && (
          <div>
            <h2 className="mb-4 text-2xl font-bold">Quizzes da Aula</h2>
            <div className="space-y-4">
              {lesson.quizzes.map((quiz) => {
                const attempt = quizAttempts.find((a) => a.quizId === quiz.id);

                return (
                  <Card key={quiz.id}>
                    <CardHeader>
                      <CardTitle>{quiz.title}</CardTitle>
                      {quiz.description && <CardDescription>{quiz.description}</CardDescription>}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">
                            {quiz._count.questions} questões
                          </p>
                          <p className="text-sm text-gray-600">
                            Nota mínima: {quiz.passingScore}%
                          </p>
                          {attempt && (
                            <p className="mt-2 text-sm">
                              Status:{" "}
                              <span className={attempt.passed ? "text-green-600" : "text-red-600"}>
                                {attempt.passed ? "Aprovado" : "Reprovado"} - {attempt.score}%
                              </span>
                            </p>
                          )}
                        </div>
                        <Link
                          href={`/dashboard/courses/${courseId}/lessons/${lessonId}/quizzes/${quiz.id}`}
                        >
                          <Button disabled={!!attempt && attempt.passed}>
                            {attempt
                              ? attempt.passed
                                ? "Aprovado"
                                : "Tentar Novamente"
                              : "Fazer Quiz"}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
