import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Olá, {user.name}!</h1>
        <p className="text-gray-600">Bem-vindo de volta à sua dashboard</p>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cursos Ativos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollmentsCount}</div>
            <p className="text-xs text-muted-foreground">Cursos em andamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificados</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{certificatesCount}</div>
            <p className="text-xs text-muted-foreground">Certificados obtidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas de Estudo</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0h</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cursos Recentes</CardTitle>
          <CardDescription>Continue de onde você parou</CardDescription>
        </CardHeader>
        <CardContent>
          {recentEnrollments.length === 0 ? (
            <p className="text-center text-gray-500">Você ainda não está inscrito em nenhum curso.</p>
          ) : (
            <div className="space-y-4">
              {recentEnrollments.map((enrollment) => (
                <div key={enrollment.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <h3 className="font-semibold">{enrollment.course.title}</h3>
                    <p className="text-sm text-gray-600">{enrollment.course.description}</p>
                  </div>
                  <div className="text-sm text-gray-500">{enrollment.course.level}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
