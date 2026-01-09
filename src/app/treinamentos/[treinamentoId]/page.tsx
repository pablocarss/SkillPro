"use client";

import { useState, useEffect, use } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import {
  Briefcase,
  BookOpen,
  Award,
  Building2,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Video,
  FileText,
  Play,
  Check,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  content: string;
  videoUrl: string | null;
  order: number;
  completed: boolean;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  order: number;
  lessons: Lesson[];
}

interface Training {
  id: string;
  title: string;
  description: string;
  level: string | null;
  duration: string | null;
  passingScore: number;
  company: {
    id: string;
    name: string;
  };
  modules: Module[];
  progress: {
    total: number;
    completed: number;
    percentage: number;
  };
  examPassed: boolean;
  hasCertificate: boolean;
  certificateId: string | null;
}

export default function TrainingViewPage({ params }: { params: Promise<{ treinamentoId: string }> }) {
  const resolvedParams = use(params);
  const { toast } = useToast();
  const [training, setTraining] = useState<Training | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTraining();
  }, [resolvedParams.treinamentoId]);

  const fetchTraining = async () => {
    try {
      const response = await fetch(`/api/treinamentos/${resolvedParams.treinamentoId}`);
      if (response.ok) {
        const data = await response.json();
        setTraining(data);
        // Selecionar primeira aula não concluída ou a primeira
        const firstIncomplete = data.modules
          .flatMap((m: Module) => m.lessons)
          .find((l: Lesson) => !l.completed);
        setSelectedLesson(firstIncomplete || data.modules[0]?.lessons[0] || null);
      } else {
        toast({
          variant: "destructive",
          title: "Você não tem acesso a este treinamento",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar treinamento",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!selectedLesson || !training) return;

    try {
      const response = await fetch(
        `/api/treinamentos/${training.id}/lessons/${selectedLesson.id}/progress`,
        { method: "POST" }
      );

      if (response.ok) {
        toast({ title: "Aula marcada como concluída!" });
        fetchTraining();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao marcar aula como concluída",
      });
    }
  };

  const getNextLesson = (): Lesson | null => {
    if (!training || !selectedLesson) return null;

    const allLessons = training.modules.flatMap((m) => m.lessons);
    const currentIndex = allLessons.findIndex((l) => l.id === selectedLesson.id);
    return allLessons[currentIndex + 1] || null;
  };

  const handleNextLesson = () => {
    const next = getNextLesson();
    if (next) {
      setSelectedLesson(next);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!training) {
    return (
      <div className="text-center py-12">
        <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Treinamento não encontrado</h3>
        <Link href="/treinamentos">
          <Button variant="link">Voltar aos treinamentos</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/treinamentos"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar aos treinamentos
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {training.level && <Badge variant="outline">{training.level}</Badge>}
              <Badge
                variant={training.progress.percentage === 100 ? "default" : "secondary"}
                className={training.progress.percentage === 100 ? "bg-green-500" : ""}
              >
                {training.progress.percentage}% concluído
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">{training.title}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <Building2 className="h-4 w-4" />
              {training.company.name}
            </p>
          </div>
          {training.hasCertificate && (
            <Link href="/treinamentos/certificados">
              <Button>
                <Award className="mr-2 h-4 w-4" />
                Ver Certificado
              </Button>
            </Link>
          )}
        </div>

        <div className="mt-4">
          <Progress value={training.progress.percentage} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {training.progress.completed} de {training.progress.total} aulas concluídas
          </p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - Lesson Viewer */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              {selectedLesson ? (
                <>
                  <div className="flex items-center gap-2">
                    {selectedLesson.completed && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                    <CardTitle className="text-lg">{selectedLesson.title}</CardTitle>
                  </div>
                  {selectedLesson.description && (
                    <CardDescription>{selectedLesson.description}</CardDescription>
                  )}
                </>
              ) : (
                <CardTitle>Selecione uma aula</CardTitle>
              )}
            </CardHeader>
            <CardContent>
              {selectedLesson ? (
                <div className="space-y-6">
                  {selectedLesson.videoUrl && (
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                      <iframe
                        src={selectedLesson.videoUrl.replace("watch?v=", "embed/")}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}

                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: selectedLesson.content.replace(/\n/g, "<br />") }} />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                    {!selectedLesson.completed && (
                      <Button onClick={handleMarkComplete} className="flex-1">
                        <Check className="mr-2 h-4 w-4" />
                        Marcar como Concluída
                      </Button>
                    )}
                    {getNextLesson() && (
                      <Button
                        variant={selectedLesson.completed ? "default" : "outline"}
                        onClick={handleNextLesson}
                        className="flex-1"
                      >
                        Próxima Aula
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Selecione uma aula na lista ao lado para começar.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Module List */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Conteúdo do Treinamento</CardTitle>
              <CardDescription>
                {training.modules.length} módulos • {training.progress.total} aulas
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Accordion type="multiple" defaultValue={training.modules.map((m) => m.id)}>
                {training.modules.map((module) => (
                  <AccordionItem key={module.id} value={module.id}>
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center gap-2 text-left">
                        <span className="font-medium text-sm">{module.title}</span>
                        <Badge variant="secondary" className="text-xs">
                          {module.lessons.filter((l) => l.completed).length}/{module.lessons.length}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-1 px-2 pb-2">
                        {module.lessons.map((lesson) => (
                          <button
                            key={lesson.id}
                            onClick={() => setSelectedLesson(lesson)}
                            className={`w-full flex items-center gap-2 p-2 rounded text-left text-sm transition-colors ${
                              selectedLesson?.id === lesson.id
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-muted"
                            }`}
                          >
                            {lesson.completed ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                            ) : lesson.videoUrl ? (
                              <Video className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            ) : (
                              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            )}
                            <span className="truncate">{lesson.title}</span>
                          </button>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Prova Final */}
          {training.progress.percentage === 100 && !training.examPassed && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-base">Prova Final</CardTitle>
                <CardDescription>
                  Complete a prova para obter seu certificado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={`/treinamentos/${training.id}/prova`}>
                  <Button className="w-full">
                    <Play className="mr-2 h-4 w-4" />
                    Iniciar Prova
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {training.examPassed && !training.hasCertificate && (
            <Card className="mt-4 border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-base text-green-600 dark:text-green-400">
                  Parabéns! Você passou!
                </CardTitle>
                <CardDescription>
                  Seu certificado está sendo gerado.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
