import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { BookOpen, Clock, PlayCircle, TrendingUp } from "lucide-react";

export default async function StudentCoursesPage() {
  const user = await requireAuth();

  // Buscar apenas cursos APROVADOS (pagos ou aprovados pelo admin)
  const enrollments = await prisma.enrollment.findMany({
    where: {
      studentId: user.id,
      status: "APPROVED",
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          description: true,
          level: true,
          duration: true,
          thumbnail: true,
          modules: {
            include: {
              _count: {
                select: {
                  lessons: true,
                },
              },
            },
          },
        },
      },
    },
  });

  // Buscar progresso de aulas para cada curso
  const progressData = await Promise.all(
    enrollments.map(async (enrollment) => {
      const completedLessons = await prisma.lessonProgress.count({
        where: {
          studentId: user.id,
          lesson: {
            module: {
              courseId: enrollment.courseId,
            },
          },
          completed: true,
        },
      });
      return { enrollmentId: enrollment.id, completedLessons };
    })
  );

  // Calcular total de aulas
  const totalLessons = (modules: any[]) => {
    return modules.reduce((acc, module) => acc + module._count.lessons, 0);
  };

  // Calcular progresso
  const calculateProgress = (enrollment: any, enrollmentId: string) => {
    const total = totalLessons(enrollment.course.modules);
    if (total === 0) return 0;
    const progressInfo = progressData.find(p => p.enrollmentId === enrollmentId);
    const completed = progressInfo?.completedLessons || 0;
    return Math.round((completed / total) * 100);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Meus Cursos</h1>
        <p className="text-gray-600">Cursos em que você está matriculado (aprovados ou pagos)</p>
      </div>

      {enrollments.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => {
            const lessonsCount = totalLessons(enrollment.course.modules);
            const progress = calculateProgress(enrollment, enrollment.id);

            return (
              <Card key={enrollment.id} className="flex flex-col overflow-hidden group hover:shadow-lg transition-shadow">
                {/* Thumbnail */}
                <Link href={`/dashboard/courses/${enrollment.course.id}`}>
                  <div className="aspect-video w-full overflow-hidden bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center cursor-pointer">
                    {enrollment.course.thumbnail ? (
                      <img
                        src={enrollment.course.thumbnail}
                        alt={enrollment.course.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <PlayCircle className="h-16 w-16 text-primary/40 group-hover:scale-110 transition-transform" />
                    )}
                  </div>
                </Link>

                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-green-500 text-white text-xs">Matriculado</Badge>
                    {enrollment.course.level && (
                      <Badge variant="secondary" className="text-xs">
                        {enrollment.course.level}
                      </Badge>
                    )}
                  </div>
                  <Link href={`/dashboard/courses/${enrollment.course.id}`} className="hover:text-primary transition-colors">
                    <CardTitle className="line-clamp-2">{enrollment.course.title}</CardTitle>
                  </Link>
                  <CardDescription className="line-clamp-2">{enrollment.course.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>{lessonsCount} aulas</span>
                    </div>
                    {enrollment.course.duration && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{enrollment.course.duration}</span>
                      </div>
                    )}

                    {/* Barra de Progresso */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Progresso
                        </span>
                        <span className="font-semibold">{progress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <Link href={`/dashboard/courses/${enrollment.course.id}`} className="mt-4">
                    <Button className="w-full">
                      {progress > 0 ? "Continuar Estudando" : "Começar Curso"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Você ainda não está matriculado em nenhum curso
            </h3>
            <p className="text-muted-foreground mb-6">
              Explore nosso catálogo e encontre o curso perfeito para você
            </p>
            <Link href="/dashboard/catalog">
              <Button>Ver Todos os Cursos</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
