import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

// Força renderização dinâmica (SSR) - evita erro de build sem banco de dados
export const dynamic = 'force-dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { BookOpen, Clock, Award, CheckCircle2 } from "lucide-react";
import { redirect } from "next/navigation";
import { GenerateCertificateButton } from "@/components/generate-certificate-button";

export default async function CourseViewPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const user = await requireAuth();
  const { courseId } = await params;

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

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        include: {
          lessons: {
            include: {
              quizzes: true,
              progress: {
                where: {
                  studentId: user.id,
                },
              },
            },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
      finalExam: {
        include: {
          _count: {
            select: { questions: true },
          },
        },
      },
    },
  });

  if (!course) {
    redirect("/dashboard/courses");
  }

  const quizAttempts = await prisma.studentQuizAttempt.findMany({
    where: {
      studentId: user.id,
      quiz: {
        lesson: {
          module: {
            courseId,
          },
        },
      },
    },
  });

  const examAttempt = await prisma.studentExamAttempt.findFirst({
    where: {
      studentId: user.id,
      exam: {
        courseId,
      },
    },
  });

  const certificate = await prisma.certificate.findFirst({
    where: {
      studentId: user.id,
      courseId,
    },
  });

  const allLessons = course.modules.flatMap((module) => module.lessons);
  const completedLessons = allLessons.filter((lesson) => lesson.progress.length > 0 && lesson.progress[0].completed).length;
  const totalLessons = allLessons.length;
  const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <div>
      <div className="mb-8">
        <Link href="/dashboard/courses" className="text-sm text-gray-600 hover:text-primary">
          ← Voltar para Meus Cursos
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">{course.title}</h1>
        <p className="text-gray-600">{course.description}</p>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(progress)}%</div>
            <Progress value={progress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aulas Completas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedLessons}/{totalLessons}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificado</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{certificate ? "✓" : "-"}</div>
            <p className="text-xs text-muted-foreground">
              {certificate ? "Obtido" : "Não obtido"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Certificate Generation Section */}
      <div className="mb-8">
        <GenerateCertificateButton
          courseId={courseId}
          studentId={user.id}
          hasPassed={!!examAttempt?.passed}
          hasCertificate={!!certificate}
        />
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="mb-4 text-2xl font-bold">Módulos e Aulas</h2>
          <div className="space-y-8">
            {course.modules.map((module, moduleIndex) => (
              <div key={module.id} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-bold">
                    {moduleIndex + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{module.title}</h3>
                    {module.description && <p className="text-sm text-gray-600">{module.description}</p>}
                  </div>
                </div>

                <div className="ml-5 space-y-3 border-l-2 border-gray-200 pl-6">
                  {module.lessons.map((lesson, lessonIndex) => {
                    const isCompleted = lesson.progress.length > 0 && lesson.progress[0].completed;
                    const lessonQuizAttempts = quizAttempts.filter((a) =>
                      lesson.quizzes.some((q) => q.id === a.quizId)
                    );
                    const allQuizzesPassed = lesson.quizzes.every((quiz) =>
                      lessonQuizAttempts.some((a) => a.quizId === quiz.id && a.passed)
                    );

                    return (
                      <Card key={lesson.id} className={isCompleted ? "border-green-200 bg-green-50" : ""}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                                isCompleted
                                  ? "bg-green-600 text-white"
                                  : "bg-gray-200 text-gray-600"
                              }`}>
                                {isCompleted ? (
                                  <CheckCircle2 className="h-5 w-5" />
                                ) : (
                                  `${lessonIndex + 1}`
                                )}
                              </div>
                              <div>
                                <CardTitle className="text-lg">
                                  {lesson.title}
                                  {lesson.videoUrl && (
                                    <span className="ml-2 text-xs font-normal text-gray-500">(com vídeo)</span>
                                  )}
                                </CardTitle>
                                {lesson.description && (
                                  <CardDescription>{lesson.description}</CardDescription>
                                )}
                                {lesson.quizzes.length > 0 && (
                                  <p className="mt-1 text-xs text-gray-600">
                                    {lesson.quizzes.length} quiz{lesson.quizzes.length > 1 ? "zes" : ""}
                                    {allQuizzesPassed && (
                                      <span className="ml-2 text-green-600">✓ Completo</span>
                                    )}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Link href={`/dashboard/courses/${courseId}/lessons/${lesson.id}`}>
                              <Button variant={isCompleted ? "outline" : "default"}>
                                {isCompleted ? "Revisar" : "Iniciar"}
                              </Button>
                            </Link>
                          </div>
                        </CardHeader>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {course.finalExam && (
          <div>
            <h2 className="mb-4 text-2xl font-bold">Prova Final</h2>
            <Card>
              <CardHeader>
                <CardTitle>{course.finalExam.title}</CardTitle>
                <CardDescription>{course.finalExam.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      {course.finalExam._count.questions} questões
                    </p>
                    <p className="text-sm text-gray-600">
                      Nota mínima: {course.finalExam.passingScore}%
                    </p>
                    {examAttempt && (
                      <p className="mt-2 text-sm">
                        Status:{" "}
                        <span className={examAttempt.passed ? "text-green-600" : "text-red-600"}>
                          {examAttempt.passed ? "Aprovado" : "Reprovado"} - {examAttempt.score}%
                        </span>
                      </p>
                    )}
                  </div>
                  <Link href={`/dashboard/courses/${courseId}/final-exam`}>
                    <Button disabled={!!examAttempt && examAttempt.passed}>
                      {examAttempt
                        ? examAttempt.passed
                          ? "Aprovado"
                          : "Tentar Novamente"
                        : "Fazer Prova"}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
