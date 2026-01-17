import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

// Força renderização dinâmica (SSR) - evita erro de build sem banco de dados
export const dynamic = 'force-dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CompleteLessonButton } from "./complete-lesson-button";
import { VideoPlayer } from "@/components/video-player";
import { ExternalVideoPlayer } from "@/components/external-video-player";
import { isExternalVideoUrl } from "@/lib/video-utils";
import { FileText, FileSpreadsheet, Presentation, Archive, File, Download } from "lucide-react";

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
      materials: {
        orderBy: { order: "asc" },
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
              <div className="mb-6">
                {/* Detecta se é URL externa (YouTube, Vimeo, etc) ou vídeo do MinIO */}
                {isExternalVideoUrl(lesson.videoUrl) ? (
                  <ExternalVideoPlayer
                    videoUrl={lesson.videoUrl}
                    title={lesson.title}
                  />
                ) : (
                  <VideoPlayer
                    lessonId={lessonId}
                    userName={user.name}
                  />
                )}
              </div>
            )}
            <div className="prose max-w-none">
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
                    className="flex items-center justify-between rounded-lg border bg-gray-50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className={`h-5 w-5 ${FILE_ICONS[material.fileType.toLowerCase()] || "text-gray-500"}`} />
                      <div>
                        <p className="font-medium text-gray-900">{material.title}</p>
                        {material.description && (
                          <p className="text-sm text-gray-500">{material.description}</p>
                        )}
                        <p className="text-xs text-gray-400">
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
