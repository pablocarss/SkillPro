"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Briefcase, BookOpen, Award, Clock, Building2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface TrainingEnrollment {
  id: string;
  enrolledAt: string;
  completedAt: string | null;
  training: {
    id: string;
    title: string;
    description: string;
    level: string | null;
    duration: string | null;
    thumbnail: string | null;
    company: {
      id: string;
      name: string;
    };
    modulesCount: number;
  };
  progress: {
    total: number;
    completed: number;
    percentage: number;
  };
  hasCertificate: boolean;
  certificateId: string | null;
}

export default function TreinamentosPage() {
  const { toast } = useToast();
  const [enrollments, setEnrollments] = useState<TrainingEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const response = await fetch("/api/treinamentos");
      const data = await response.json();
      setEnrollments(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar treinamentos",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const inProgressTrainings = enrollments.filter(
    (e) => e.progress.percentage < 100 && !e.hasCertificate
  );
  const completedTrainings = enrollments.filter(
    (e) => e.progress.percentage === 100 || e.hasCertificate
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Meus Treinamentos</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Acompanhe seus treinamentos corporativos
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-4 mb-6 sm:mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total</span>
            </div>
            <p className="text-2xl font-bold">{enrollments.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Em Andamento</span>
            </div>
            <p className="text-2xl font-bold">{inProgressTrainings.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Concluídos</span>
            </div>
            <p className="text-2xl font-bold">{completedTrainings.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Certificados</span>
            </div>
            <p className="text-2xl font-bold">
              {enrollments.filter((e) => e.hasCertificate).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* In Progress Trainings */}
      {inProgressTrainings.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Em Andamento</h2>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {inProgressTrainings.map((enrollment) => (
              <Card key={enrollment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {enrollment.training.level && (
                        <Badge variant="outline" className="mb-2">
                          {enrollment.training.level}
                        </Badge>
                      )}
                      <CardTitle className="text-base sm:text-lg line-clamp-2">
                        {enrollment.training.title}
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm line-clamp-2 mt-1">
                        {enrollment.training.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>{enrollment.training.company.name}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-medium">{enrollment.progress.percentage}%</span>
                    </div>
                    <Progress value={enrollment.progress.percentage} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {enrollment.progress.completed} de {enrollment.progress.total} aulas
                    </p>
                  </div>

                  <Link href={`/treinamentos/${enrollment.training.id}`}>
                    <Button className="w-full">
                      Continuar Treinamento
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Completed Trainings */}
      {completedTrainings.length > 0 && (
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Concluídos</h2>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {completedTrainings.map((enrollment) => (
              <Card key={enrollment.id} className="hover:shadow-lg transition-shadow border-green-200 dark:border-green-800">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex gap-2 mb-2">
                        <Badge className="bg-green-500 hover:bg-green-600">
                          Concluído
                        </Badge>
                        {enrollment.training.level && (
                          <Badge variant="outline">{enrollment.training.level}</Badge>
                        )}
                      </div>
                      <CardTitle className="text-base sm:text-lg line-clamp-2">
                        {enrollment.training.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>{enrollment.training.company.name}</span>
                  </div>

                  <div className="space-y-2">
                    <Progress value={100} className="h-2 bg-green-100 dark:bg-green-900" />
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Todas as aulas concluídas!
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/treinamentos/${enrollment.training.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        Ver Conteúdo
                      </Button>
                    </Link>
                    {enrollment.hasCertificate && (
                      <Link href={`/treinamentos/certificados`}>
                        <Button variant="default">
                          <Award className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {enrollments.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Nenhum treinamento encontrado</h3>
          <p className="text-muted-foreground">
            Você ainda não está matriculado em nenhum treinamento.
          </p>
        </div>
      )}
    </div>
  );
}
