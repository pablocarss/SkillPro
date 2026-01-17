import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

// Força renderização dinâmica (SSR) - evita erro de build sem banco de dados
export const dynamic = 'force-dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Award, Clock } from "lucide-react";

export default async function DashboardPage() {
  const user = await requireAuth();

  const enrollmentsCount = await prisma.enrollment.count({
    where: {
      studentId: user.id,
      status: "APPROVED",
    },
  });

  const certificatesCount = await prisma.certificate.count({
    where: {
      studentId: user.id,
    },
  });

  const recentEnrollments = await prisma.enrollment.findMany({
    where: {
      studentId: user.id,
      status: "APPROVED",
    },
    include: {
      course: true,
    },
    take: 5,
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Olá, {user.name}!</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Bem-vindo de volta à sua dashboard</p>
      </div>

      <div className="mb-6 sm:mb-8 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Cursos Ativos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold">{enrollmentsCount}</div>
            <p className="text-xs text-muted-foreground">Cursos em andamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Certificados</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold">{certificatesCount}</div>
            <p className="text-xs text-muted-foreground">Certificados obtidos</p>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Horas de Estudo</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold">0h</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Cursos Recentes</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Continue de onde você parou</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          {recentEnrollments.length === 0 ? (
            <p className="text-center text-sm sm:text-base text-muted-foreground py-4">Você ainda não está inscrito em nenhum curso.</p>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {recentEnrollments.map((enrollment) => (
                <div key={enrollment.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 rounded-lg border p-3 sm:p-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm sm:text-base truncate">{enrollment.course.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-1">{enrollment.course.description}</p>
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">{enrollment.course.level}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
