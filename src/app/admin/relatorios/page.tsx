"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  BookOpen,
  Briefcase,
  Building2,
  GraduationCap,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  ChevronDown,
} from "lucide-react";

interface EnrollmentDetail {
  id: string;
  student?: {
    id: string;
    name: string;
    email: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
    company?: {
      name: string;
    } | null;
  };
  enrolledAt: string;
  completedLessons: number;
  totalLessons: number;
  progressPercentage: number;
  hasCertificate: boolean;
  lastLesson: string | null;
  lastActivity: string;
  status: "completed" | "in_progress" | "not_started";
}

interface CourseDetail {
  id: string;
  title: string;
  totalLessons: number;
  totalEnrollments: number;
  statusCount: {
    completed: number;
    in_progress: number;
    not_started: number;
  };
  completionRate: number;
  enrollments: EnrollmentDetail[];
}

interface TrainingDetail {
  id: string;
  title: string;
  company: string | null;
  linkedCompanies: string[];
  totalLessons: number;
  totalEnrollments: number;
  statusCount: {
    completed: number;
    in_progress: number;
    not_started: number;
  };
  byCompany: Record<string, number>;
  completionRate: number;
  enrollments: EnrollmentDetail[];
}

interface StoppedStudent extends EnrollmentDetail {
  courseName?: string;
  courseId?: string;
  trainingName?: string;
  trainingId?: string;
}

interface ReportData {
  general: {
    totalUsers: number;
    totalStudents: number;
    totalEmployees: number;
    totalCompanies: number;
    totalCourses: number;
    totalTrainings: number;
  };
  courses: {
    totalEnrollments: number;
    completedEnrollments: number;
    completionRate: number;
    courses: CourseDetail[];
    stoppedStudents: StoppedStudent[];
  };
  trainings: {
    totalEnrollments: number;
    completedEnrollments: number;
    completionRate: number;
    trainings: TrainingDetail[];
    stoppedEmployees: StoppedStudent[];
  };
}

export default function AdminReportsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<ReportData | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [selectedTraining, setSelectedTraining] = useState<string>("all");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/reports");
      if (response.ok) {
        const reportData = await response.json();
        setData(reportData);
      } else {
        throw new Error("Failed to fetch reports");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar relatórios",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Concluído</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-500">Em andamento</Badge>;
      case "not_started":
        return <Badge variant="secondary">Não iniciado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const exportToCSV = (type: "courses" | "trainings") => {
    if (!data) return;

    let csvContent = "";

    if (type === "courses") {
      csvContent = "Curso,Aluno,Email,Progresso,Status,Última Atividade,Última Aula\n";
      data.courses.courses.forEach((course) => {
        course.enrollments.forEach((e) => {
          const name = e.student?.name || "";
          const email = e.student?.email || "";
          csvContent += `"${course.title}","${name}","${email}",${e.progressPercentage}%,${e.status},"${formatDateTime(e.lastActivity)}","${e.lastLesson || ""}"\n`;
        });
      });
    } else {
      csvContent = "Treinamento,Funcionário,Email,Empresa,Progresso,Status,Última Atividade,Última Aula\n";
      data.trainings.trainings.forEach((training) => {
        training.enrollments.forEach((e) => {
          const name = e.user?.name || "";
          const email = e.user?.email || "";
          const company = e.user?.company?.name || "";
          csvContent += `"${training.title}","${name}","${email}","${company}",${e.progressPercentage}%,${e.status},"${formatDateTime(e.lastActivity)}","${e.lastLesson || ""}"\n`;
        });
      });
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-${type}-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p>Erro ao carregar relatórios</p>
        <Button onClick={fetchReports} className="mt-4">
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">
            Acompanhe o progresso de alunos e funcionários
          </p>
        </div>
        <Button onClick={fetchReports} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* General Stats */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Usuários</span>
            </div>
            <p className="text-2xl font-bold">{data.general.totalUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Alunos</span>
            </div>
            <p className="text-2xl font-bold">{data.general.totalStudents}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Funcionários</span>
            </div>
            <p className="text-2xl font-bold">{data.general.totalEmployees}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Empresas</span>
            </div>
            <p className="text-2xl font-bold">{data.general.totalCompanies}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Cursos</span>
            </div>
            <p className="text-2xl font-bold">{data.general.totalCourses}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Treinamentos</span>
            </div>
            <p className="text-2xl font-bold">{data.general.totalTrainings}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Courses and Trainings */}
      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="courses">
            <BookOpen className="mr-2 h-4 w-4" />
            Cursos EAD
          </TabsTrigger>
          <TabsTrigger value="trainings">
            <Briefcase className="mr-2 h-4 w-4" />
            Treinamentos
          </TabsTrigger>
        </TabsList>

        {/* COURSES TAB */}
        <TabsContent value="courses" className="space-y-6">
          {/* Course Summary */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-4">
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Matrículas</p>
                    <p className="text-3xl font-bold">{data.courses.totalEnrollments}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Concluídos</p>
                    <p className="text-3xl font-bold">{data.courses.completedEnrollments}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-purple-200 bg-purple-50/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
                    <p className="text-3xl font-bold">{data.courses.completionRate}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-orange-200 bg-orange-50/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Parados (+7 dias)</p>
                    <p className="text-3xl font-bold">{data.courses.stoppedStudents.length}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Course Filter and Export */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-full sm:w-[300px]">
                <SelectValue placeholder="Filtrar por curso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os cursos</SelectItem>
                {data.courses.courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => exportToCSV("courses")}>
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>

          {/* Courses Details */}
          <Accordion type="multiple" className="space-y-4">
            {data.courses.courses
              .filter((c) => selectedCourse === "all" || c.id === selectedCourse)
              .map((course) => (
                <AccordionItem key={course.id} value={course.id} className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-left w-full pr-4">
                      <span className="font-semibold">{course.title}</span>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{course.totalEnrollments} alunos</Badge>
                        <Badge className="bg-green-500">{course.statusCount.completed} concluídos</Badge>
                        <Badge className="bg-blue-500">{course.statusCount.in_progress} em andamento</Badge>
                        <Badge variant="secondary">{course.statusCount.not_started} não iniciados</Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-4">
                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Taxa de conclusão</span>
                          <span className="font-medium">{course.completionRate}%</span>
                        </div>
                        <Progress value={course.completionRate} className="h-2" />
                      </div>

                      {/* Enrollments Table */}
                      {course.enrollments.length > 0 ? (
                        <div className="border rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Aluno</TableHead>
                                <TableHead>Progresso</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="hidden sm:table-cell">Última Aula</TableHead>
                                <TableHead className="hidden sm:table-cell">Última Atividade</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {course.enrollments.map((enrollment) => (
                                <TableRow key={enrollment.id}>
                                  <TableCell>
                                    <div>
                                      <p className="font-medium">{enrollment.student?.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {enrollment.student?.email}
                                      </p>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Progress
                                        value={enrollment.progressPercentage}
                                        className="w-16 h-2"
                                      />
                                      <span className="text-sm">
                                        {enrollment.progressPercentage}%
                                      </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      {enrollment.completedLessons}/{enrollment.totalLessons} aulas
                                    </p>
                                  </TableCell>
                                  <TableCell>{getStatusBadge(enrollment.status)}</TableCell>
                                  <TableCell className="hidden sm:table-cell">
                                    <span className="text-sm text-muted-foreground">
                                      {enrollment.lastLesson || "-"}
                                    </span>
                                  </TableCell>
                                  <TableCell className="hidden sm:table-cell">
                                    <span className="text-sm text-muted-foreground">
                                      {formatDateTime(enrollment.lastActivity)}
                                    </span>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <p className="text-center py-4 text-muted-foreground">
                          Nenhum aluno matriculado
                        </p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
          </Accordion>

          {/* Stopped Students Alert */}
          {data.courses.stoppedStudents.length > 0 && (
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="h-5 w-5" />
                  Alunos Parados (sem atividade há mais de 7 dias)
                </CardTitle>
                <CardDescription>
                  Estes alunos iniciaram mas não acessaram o curso recentemente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Aluno</TableHead>
                        <TableHead>Curso</TableHead>
                        <TableHead>Progresso</TableHead>
                        <TableHead className="hidden sm:table-cell">Parou em</TableHead>
                        <TableHead className="hidden sm:table-cell">Última Atividade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.courses.stoppedStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{student.student?.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {student.student?.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{student.courseName}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress
                                value={student.progressPercentage}
                                className="w-16 h-2"
                              />
                              <span className="text-sm">{student.progressPercentage}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <span className="text-sm">{student.lastLesson || "-"}</span>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <span className="text-sm text-muted-foreground">
                              {formatDateTime(student.lastActivity)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TRAININGS TAB */}
        <TabsContent value="trainings" className="space-y-6">
          {/* Training Summary */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-4">
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Matrículas</p>
                    <p className="text-3xl font-bold">{data.trainings.totalEnrollments}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Concluídos</p>
                    <p className="text-3xl font-bold">{data.trainings.completedEnrollments}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-purple-200 bg-purple-50/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
                    <p className="text-3xl font-bold">{data.trainings.completionRate}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-orange-200 bg-orange-50/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Parados (+7 dias)</p>
                    <p className="text-3xl font-bold">{data.trainings.stoppedEmployees.length}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Training Filter and Export */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <Select value={selectedTraining} onValueChange={setSelectedTraining}>
              <SelectTrigger className="w-full sm:w-[300px]">
                <SelectValue placeholder="Filtrar por treinamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os treinamentos</SelectItem>
                {data.trainings.trainings.map((training) => (
                  <SelectItem key={training.id} value={training.id}>
                    {training.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => exportToCSV("trainings")}>
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>

          {/* Trainings Details */}
          <Accordion type="multiple" className="space-y-4">
            {data.trainings.trainings
              .filter((t) => selectedTraining === "all" || t.id === selectedTraining)
              .map((training) => (
                <AccordionItem key={training.id} value={training.id} className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-left w-full pr-4">
                      <div>
                        <span className="font-semibold">{training.title}</span>
                        {training.linkedCompanies.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {training.linkedCompanies.join(", ")}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{training.totalEnrollments} funcionários</Badge>
                        <Badge className="bg-green-500">{training.statusCount.completed} concluídos</Badge>
                        <Badge className="bg-blue-500">{training.statusCount.in_progress} em andamento</Badge>
                        <Badge variant="secondary">{training.statusCount.not_started} não iniciados</Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-4">
                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Taxa de conclusão</span>
                          <span className="font-medium">{training.completionRate}%</span>
                        </div>
                        <Progress value={training.completionRate} className="h-2" />
                      </div>

                      {/* By Company Stats */}
                      {Object.keys(training.byCompany).length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(training.byCompany).map(([company, count]) => (
                            <Badge key={company} variant="outline">
                              <Building2 className="mr-1 h-3 w-3" />
                              {company}: {count}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Enrollments Table */}
                      {training.enrollments.length > 0 ? (
                        <div className="border rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Funcionário</TableHead>
                                <TableHead className="hidden sm:table-cell">Empresa</TableHead>
                                <TableHead>Progresso</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="hidden sm:table-cell">Última Aula</TableHead>
                                <TableHead className="hidden sm:table-cell">Última Atividade</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {training.enrollments.map((enrollment) => (
                                <TableRow key={enrollment.id}>
                                  <TableCell>
                                    <div>
                                      <p className="font-medium">{enrollment.user?.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {enrollment.user?.email}
                                      </p>
                                    </div>
                                  </TableCell>
                                  <TableCell className="hidden sm:table-cell">
                                    <span className="text-sm">
                                      {enrollment.user?.company?.name || "-"}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Progress
                                        value={enrollment.progressPercentage}
                                        className="w-16 h-2"
                                      />
                                      <span className="text-sm">
                                        {enrollment.progressPercentage}%
                                      </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      {enrollment.completedLessons}/{enrollment.totalLessons} aulas
                                    </p>
                                  </TableCell>
                                  <TableCell>{getStatusBadge(enrollment.status)}</TableCell>
                                  <TableCell className="hidden sm:table-cell">
                                    <span className="text-sm text-muted-foreground">
                                      {enrollment.lastLesson || "-"}
                                    </span>
                                  </TableCell>
                                  <TableCell className="hidden sm:table-cell">
                                    <span className="text-sm text-muted-foreground">
                                      {formatDateTime(enrollment.lastActivity)}
                                    </span>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <p className="text-center py-4 text-muted-foreground">
                          Nenhum funcionário matriculado
                        </p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
          </Accordion>

          {/* Stopped Employees Alert */}
          {data.trainings.stoppedEmployees.length > 0 && (
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="h-5 w-5" />
                  Funcionários Parados (sem atividade há mais de 7 dias)
                </CardTitle>
                <CardDescription>
                  Estes funcionários iniciaram mas não acessaram o treinamento recentemente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Funcionário</TableHead>
                        <TableHead>Treinamento</TableHead>
                        <TableHead>Progresso</TableHead>
                        <TableHead className="hidden sm:table-cell">Parou em</TableHead>
                        <TableHead className="hidden sm:table-cell">Última Atividade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.trainings.stoppedEmployees.map((employee) => (
                        <TableRow key={employee.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{employee.user?.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {employee.user?.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{employee.trainingName}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress
                                value={employee.progressPercentage}
                                className="w-16 h-2"
                              />
                              <span className="text-sm">{employee.progressPercentage}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <span className="text-sm">{employee.lastLesson || "-"}</span>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <span className="text-sm text-muted-foreground">
                              {formatDateTime(employee.lastActivity)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
