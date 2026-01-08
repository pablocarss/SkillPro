import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EnrollButton } from "./enroll-button";
import { BookOpen, Clock, Award, Users, PlayCircle } from "lucide-react";
import Link from "next/link";

export default async function CatalogPage() {
  const user = await requireAuth();

  // Buscar cursos publicados que o aluno ainda não se inscreveu
  const availableCourses = await prisma.course.findMany({
    where: {
      isPublished: true,
      NOT: {
        enrollments: {
          some: {
            studentId: user.id,
          },
        },
      },
    },
    select: {
      id: true,
      title: true,
      description: true,
      level: true,
      duration: true,
      price: true,
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
      _count: {
        select: {
          enrollments: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Buscar inscrições pendentes do aluno
  const pendingEnrollments = await prisma.enrollment.findMany({
    where: {
      studentId: user.id,
      status: "PENDING",
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          description: true,
          level: true,
          duration: true,
          price: true,
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

  const totalLessons = (modules: any[]) => {
    return modules.reduce((acc, module) => acc + module._count.lessons, 0);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Todos os Cursos</h1>
        <p className="text-gray-600">Explore o catálogo completo e encontre novos cursos para se inscrever</p>
      </div>

      {pendingEnrollments.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-bold">Inscrições Pendentes</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pendingEnrollments.map((enrollment) => (
              <Card key={enrollment.id} className="flex flex-col overflow-hidden border-yellow-300 bg-yellow-50/50">
                {/* Thumbnail */}
                <Link href={`/cursos/${enrollment.course.id}`}>
                  <div className="aspect-video w-full overflow-hidden bg-gradient-to-br from-yellow-200/50 via-yellow-300/50 to-orange-300/50 flex items-center justify-center cursor-pointer">
                    {enrollment.course.thumbnail ? (
                      <img
                        src={enrollment.course.thumbnail}
                        alt={enrollment.course.title}
                        className="h-full w-full object-cover opacity-90"
                      />
                    ) : (
                      <PlayCircle className="h-16 w-16 text-yellow-600/40" />
                    )}
                  </div>
                </Link>

                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-yellow-500 text-white text-xs">
                      Aguardando Aprovação
                    </Badge>
                    {enrollment.course.level && (
                      <Badge variant="secondary" className="text-xs">
                        {enrollment.course.level}
                      </Badge>
                    )}
                  </div>
                  <Link href={`/cursos/${enrollment.course.id}`} className="hover:text-primary transition-colors">
                    <CardTitle className="line-clamp-2">{enrollment.course.title}</CardTitle>
                  </Link>
                  <CardDescription className="line-clamp-2">{enrollment.course.description}</CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>{totalLessons(enrollment.course.modules)} aulas</span>
                    </div>
                    {enrollment.course.duration && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{enrollment.course.duration}</span>
                      </div>
                    )}
                    {enrollment.course.price && enrollment.course.price > 0 && (
                      <div className="flex items-center gap-2 text-green-600 font-semibold">
                        <Award className="h-4 w-4" />
                        <span>Pago - R$ {enrollment.course.price.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-4 text-2xl font-bold">Cursos Disponíveis</h2>
        {availableCourses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">
                Nenhum curso disponível no momento ou você já se inscreveu em todos os cursos.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {availableCourses.map((course) => (
              <Card key={course.id} className="flex flex-col overflow-hidden group hover:shadow-lg transition-shadow">
                {/* Thumbnail */}
                <Link href={`/cursos/${course.id}`}>
                  <div className="aspect-video w-full overflow-hidden bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center cursor-pointer">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <PlayCircle className="h-16 w-16 text-primary/40 group-hover:scale-110 transition-transform" />
                    )}
                  </div>
                </Link>

                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    {course.level && (
                      <Badge variant="secondary" className="text-xs">
                        {course.level}
                      </Badge>
                    )}
                    {course.price && course.price > 0 ? (
                      <Badge className="bg-green-500 text-white text-xs">Pago</Badge>
                    ) : (
                      <Badge className="bg-primary text-xs">Gratuito</Badge>
                    )}
                  </div>
                  <Link href={`/cursos/${course.id}`} className="hover:text-primary transition-colors">
                    <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                  </Link>
                  <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  <div className="space-y-2 text-sm flex-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>{totalLessons(course.modules)} aulas</span>
                    </div>
                    {course.duration && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{course._count.enrollments} alunos</span>
                    </div>
                  </div>

                  {/* Preço e Botão */}
                  <div className="mt-4 pt-4 border-t">
                    {course.price && course.price > 0 ? (
                      <div className="mb-3">
                        <div className="text-2xl font-bold text-primary">
                          R$ {course.price.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          pagamento único
                        </div>
                      </div>
                    ) : (
                      <div className="mb-3 text-center">
                        <Badge className="bg-green-500 text-white text-sm py-1 px-3">
                          CURSO GRATUITO
                        </Badge>
                      </div>
                    )}
                    <EnrollButton
                      courseId={course.id}
                      courseTitle={course.title}
                      price={course.price}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
