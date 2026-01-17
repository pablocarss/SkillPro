import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

// Força renderização dinâmica (SSR) - evita erro de build sem banco de dados
export const dynamic = 'force-dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { TrainingVideoPlayer } from "@/components/training-video-player";
import { ExternalVideoPlayer } from "@/components/external-video-player";
import { isExternalVideoUrl } from "@/lib/video-utils";
import { FileText, Download, ArrowLeft, CheckCircle } from "lucide-react";
import { CompleteLessonButton } from "./complete-lesson-button";

const FILE_ICONS: Record<string, string> = {
  pdf: "text-red-500",
  doc: "text-blue-500",
  docx: "text-blue-500",
  xls: "text-green-500",
  xlsx: "text-green-500",
  ppt: "text-orange-500",
  pptx: "text-orange-500",
  zip: "text-yellow-500",
  rar: "text-yellow-500",
  "7z": "text-yellow-500",
  epub: "text-purple-500",
};

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function TrainingLessonViewPage({
  params,
}: {
  params: Promise<{ trainingId: string; lessonId: string }>;
}) {
  const user = await requireAuth();
  const { trainingId, lessonId } = await params;

  // Verificar se o usuário está matriculado no treinamento
  const enrollment = await prisma.trainingEnrollment.findFirst({
    where: {
      userId: user.id,
      trainingId,
    },
  });

  // Permitir admins e funcionários matriculados
  if (user.role !== "ADMIN" && !enrollment) {
    redirect("/dashboard/treinamentos");
  }

  // Buscar a aula com materiais
  const lesson = await prisma.trainingLesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          training: true,
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
          userlId: user.id,
        },
      },
      materials: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!lesson || lesson.module.trainingId !== trainingId) {
    redirect(`/dashboard/treinamentos/${trainingId}`);
  }

  // Buscar tentativas de quiz
  const quizAttempts = await prisma.trainingQuizAttempt.findMany({
    where: {
      userId: user.id,
      quiz: {
        lessonId,
      },
    },
  });

  const isCompleted = lesson.progress.length > 0 && lesson.progress[0].completed;

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-8">
        <Link
          href={`/dashboard/treinamentos/${trainingId}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para o Treinamento
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{lesson.title}</h1>
            {lesson.description && (
              <p className="text-muted-foreground mt-1">{lesson.description}</p>
            )}
          </div>
          <CompleteLessonButton
            lessonId={lessonId}
            trainingId={trainingId}
            isCompleted={isCompleted}
          />
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Conteudo da Aula</CardTitle>
          </CardHeader>
          <CardContent>
            {lesson.videoUrl && (
              <div className="mb-6">
                {/* Detecta se é URL externa (YouTube, Vimeo, etc) ou vídeo do MinIO */}
                {isExternalVideoUrl(lesson.videoUrl) ? (
                  <ExternalVideoPlayer
                    videoUrl={lesson.videoUrl}
                    title={lesson.title}
                  />
                ) : (
                  <TrainingVideoPlayer
                    lessonId={lessonId}
                    userName={user.name}
                  />
                )}
              </div>
            )}
            <div className="prose max-w-none dark:prose-invert">
              <p className="whitespace-pre-wrap">{lesson.content}</p>
            </div>
          </CardContent>
        </Card>

        {lesson.materials.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Material de Apoio</CardTitle>
              <CardDescription>Arquivos e recursos complementares para esta aula</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lesson.materials.map((material) => (
                  <div
                    key={material.id}
                    className="flex items-center justify-between rounded-lg border bg-muted/50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className={`h-5 w-5 ${FILE_ICONS[material.fileType.toLowerCase()] || "text-gray-500"}`} />
                      <div>
                        <p className="font-medium">{material.title}</p>
                        {material.description && (
                          <p className="text-sm text-muted-foreground">{material.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {material.fileType.toUpperCase()}
                          {material.fileSize && ` - ${formatFileSize(material.fileSize)}`}
                          {material.isExternal && " (Link externo)"}
                        </p>
                      </div>
                    </div>
                    <a
                      href={material.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={!material.isExternal}
                    >
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Baixar
                      </Button>
                    </a>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {lesson.quizzes.length > 0 && (
          <div>
            <h2 className="mb-4 text-xl font-bold">Quizzes da Aula</h2>
            <div className="space-y-4">
              {lesson.quizzes.map((quiz) => {
                const attempt = quizAttempts.find((a) => a.quizId === quiz.id);

                return (
                  <Card key={quiz.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{quiz.title}</CardTitle>
                      {quiz.description && <CardDescription>{quiz.description}</CardDescription>}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {quiz._count.questions} questoes
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Nota minima: {quiz.passingScore}%
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
                          href={`/dashboard/treinamentos/${trainingId}/aulas/${lessonId}/quizzes/${quiz.id}`}
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
