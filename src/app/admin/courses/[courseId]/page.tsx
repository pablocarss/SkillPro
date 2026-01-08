"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Plus, BookOpen, FileQuestion, ClipboardList, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { VideoUpload } from "@/components/video-upload";

interface Module {
  id: string;
  title: string;
  description: string | null;
  order: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  content: string;
  videoUrl: string | null;
  order: number;
  quizzes: Quiz[];
}

interface Quiz {
  id: string;
  title: string;
  _count: {
    questions: number;
  };
}

interface Course {
  id: string;
  title: string;
  description: string;
  isPublished: boolean;
  modules: Module[];
  finalExam: {
    id: string;
    title: string;
    _count: {
      questions: number;
    };
  } | null;
}

export default function CourseManagementPage({ params }: { params: Promise<{ courseId: string }> }) {
  const resolvedParams = use(params);
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [moduleFormData, setModuleFormData] = useState({
    title: "",
    description: "",
  });

  const [lessonFormData, setLessonFormData] = useState({
    title: "",
    description: "",
    content: "",
    videoUrl: "",
  });

  useEffect(() => {
    fetchCourse();
  }, []);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${resolvedParams.courseId}`);
      const data = await response.json();
      setCourse(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar curso",
      });
    }
  };

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/courses/${resolvedParams.courseId}/modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...moduleFormData,
          order: (course?.modules.length || 0) + 1,
        }),
      });

      if (response.ok) {
        toast({
          title: "Módulo criado com sucesso!",
        });
        setIsModuleDialogOpen(false);
        setModuleFormData({ title: "", description: "" });
        fetchCourse();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar módulo",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModuleId) return;

    setIsLoading(true);

    try {
      const module = course?.modules.find((m) => m.id === selectedModuleId);
      const response = await fetch(`/api/admin/modules/${selectedModuleId}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...lessonFormData,
          order: (module?.lessons.length || 0) + 1,
        }),
      });

      if (response.ok) {
        toast({
          title: "Aula criada com sucesso!",
        });
        setIsLessonDialogOpen(false);
        setLessonFormData({ title: "", description: "", content: "", videoUrl: "" });
        setSelectedModuleId(null);
        fetchCourse();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar aula",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openLessonDialog = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setIsLessonDialogOpen(true);
  };

  const togglePublish = async () => {
    if (!course) return;
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/courses/${resolvedParams.courseId}/publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !course.isPublished }),
      });

      if (response.ok) {
        toast({
          title: course.isPublished ? "Curso despublicado!" : "Curso publicado!",
          description: course.isPublished
            ? "O curso foi removido do catálogo."
            : "O curso agora está disponível no catálogo para os alunos.",
        });
        fetchCourse();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar curso",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!course) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/courses" className="text-sm text-gray-600 hover:text-primary">
          ← Voltar para Cursos
        </Link>
        <div className="mt-2 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
            <p className="text-gray-600">{course.description}</p>
            <div className="mt-2">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                  course.isPublished
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {course.isPublished ? "✓ Publicado" : "Rascunho"}
              </span>
            </div>
          </div>
          <Button onClick={togglePublish} disabled={isLoading} variant={course.isPublished ? "outline" : "default"}>
            {isLoading ? "Atualizando..." : course.isPublished ? "Despublicar Curso" : "Publicar Curso"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="modules" className="space-y-6">
        <TabsList>
          <TabsTrigger value="modules">
            <BookOpen className="mr-2 h-4 w-4" />
            Módulos e Aulas
          </TabsTrigger>
          <TabsTrigger value="finalExam">
            <ClipboardList className="mr-2 h-4 w-4" />
            Prova Final
          </TabsTrigger>
        </TabsList>

        <TabsContent value="modules">
          <div className="mb-4 flex justify-between">
            <h2 className="text-2xl font-bold">Estrutura do Curso</h2>
            <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Módulo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Módulo</DialogTitle>
                  <DialogDescription>Adicione um módulo ao curso</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateModule} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="module-title">Título do Módulo</Label>
                    <Input
                      id="module-title"
                      value={moduleFormData.title}
                      onChange={(e) => setModuleFormData({ ...moduleFormData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="module-description">Descrição</Label>
                    <Input
                      id="module-description"
                      value={moduleFormData.description}
                      onChange={(e) => setModuleFormData({ ...moduleFormData, description: e.target.value })}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsModuleDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Criando..." : "Criar Módulo"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-6">
            {course.modules.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  Nenhum módulo criado ainda. Clique em "Novo Módulo" para começar.
                </CardContent>
              </Card>
            ) : (
              course.modules.map((module, moduleIndex) => (
                <Card key={module.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">
                          Módulo {moduleIndex + 1}: {module.title}
                        </CardTitle>
                        {module.description && <CardDescription>{module.description}</CardDescription>}
                      </div>
                      <Button onClick={() => openLessonDialog(module.id)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Aula
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {module.lessons.length === 0 ? (
                      <p className="text-sm text-gray-500">Nenhuma aula neste módulo</p>
                    ) : (
                      <div className="space-y-3">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <Card key={lesson.id} className="bg-gray-50">
                            <CardHeader className="py-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="text-base">
                                    Aula {lessonIndex + 1}: {lesson.title}
                                  </CardTitle>
                                  {lesson.description && (
                                    <CardDescription className="text-sm">{lesson.description}</CardDescription>
                                  )}
                                  <div className="mt-2 flex gap-4 text-xs text-gray-600">
                                    {lesson.videoUrl && <span>✓ Com vídeo</span>}
                                    <span>{lesson.quizzes.length} quiz(zes)</span>
                                  </div>
                                </div>
                                <Link href={`/admin/courses/${resolvedParams.courseId}/modules/${module.id}/lessons/${lesson.id}`}>
                                  <Button variant="outline" size="sm">
                                    <FileQuestion className="mr-2 h-4 w-4" />
                                    Gerenciar Quizzes
                                  </Button>
                                </Link>
                              </div>
                            </CardHeader>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Dialog para criar aula */}
          <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Nova Aula</DialogTitle>
                <DialogDescription>Adicione uma aula ao módulo</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateLesson} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="lesson-title">Título da Aula</Label>
                  <Input
                    id="lesson-title"
                    value={lessonFormData.title}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lesson-description">Descrição</Label>
                  <Input
                    id="lesson-description"
                    value={lessonFormData.description}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lesson-content">Conteúdo</Label>
                  <textarea
                    id="lesson-content"
                    className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={lessonFormData.content}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, content: e.target.value })}
                    required
                  />
                </div>

                <VideoUpload
                  onVideoUploaded={(url) => setLessonFormData({ ...lessonFormData, videoUrl: url })}
                  currentVideoUrl={lessonFormData.videoUrl}
                />

                <div className="space-y-2">
                  <Label htmlFor="lesson-videoUrl">Ou insira URL do Vídeo manualmente</Label>
                  <Input
                    id="lesson-videoUrl"
                    type="url"
                    placeholder="https://..."
                    value={lessonFormData.videoUrl}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, videoUrl: e.target.value })}
                  />
                  <p className="text-xs text-gray-500">
                    Você pode fazer upload de um vídeo acima ou inserir uma URL (YouTube, Vimeo, etc)
                  </p>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsLessonDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Criando..." : "Criar Aula"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="finalExam">
          <Card>
            <CardHeader>
              <CardTitle>Prova Final do Curso</CardTitle>
              <CardDescription>Configure a avaliação final que os alunos farão</CardDescription>
            </CardHeader>
            <CardContent>
              {course.finalExam ? (
                <div className="space-y-4">
                  <div>
                    <p className="font-medium">{course.finalExam.title}</p>
                    <p className="text-sm text-gray-600">
                      {course.finalExam._count.questions} questões cadastradas
                    </p>
                  </div>
                  <Link href={`/admin/courses/${resolvedParams.courseId}/final-exam`}>
                    <Button variant="outline">
                      <Edit className="mr-2 h-4 w-4" />
                      Editar Prova Final
                    </Button>
                  </Link>
                </div>
              ) : (
                <Link href={`/admin/courses/${resolvedParams.courseId}/final-exam`}>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Prova Final
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
