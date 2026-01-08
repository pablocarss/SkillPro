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
import { Plus, BookOpen, FileQuestion, ClipboardList } from "lucide-react";
import Link from "next/link";
import { VideoUpload } from "@/components/video-upload";

interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  order: number;
  quizzes: Array<{
    id: string;
    title: string;
    _count: {
      questions: number;
    };
  }>;
}

export default function CourseDetailsPage({ params }: { params: Promise<{ courseId: string }> }) {
  const resolvedParams = use(params);
  const { toast } = useToast();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    videoUrl: "",
  });

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const response = await fetch(`/api/courses/${resolvedParams.courseId}/lessons`);
      const data = await response.json();
      setLessons(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar aulas",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/courses/${resolvedParams.courseId}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, order: lessons.length + 1 }),
      });

      if (response.ok) {
        toast({
          title: "Aula criada com sucesso!",
        });
        setIsOpen(false);
        setFormData({ title: "", description: "", content: "", videoUrl: "" });
        fetchLessons();
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

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/admin/courses" className="text-sm text-gray-600 hover:text-primary">
            ← Voltar para Cursos
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Gerenciar Curso</h1>
          <p className="text-gray-600">Configure as aulas, quizzes e prova final</p>
        </div>
      </div>

      <Tabs defaultValue="lessons" className="space-y-6">
        <TabsList>
          <TabsTrigger value="lessons">
            <BookOpen className="mr-2 h-4 w-4" />
            Aulas
          </TabsTrigger>
          <TabsTrigger value="finalExam">
            <ClipboardList className="mr-2 h-4 w-4" />
            Prova Final
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lessons">
          <div className="mb-4 flex justify-between">
            <h2 className="text-2xl font-bold">Timeline de Aulas</h2>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Aula
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Nova Aula</DialogTitle>
                  <DialogDescription>Adicione uma nova aula ao curso</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título da Aula</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Conteúdo</Label>
                    <textarea
                      id="content"
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      required
                    />
                  </div>

                  <VideoUpload
                    onVideoUploaded={(url) => setFormData({ ...formData, videoUrl: url })}
                    currentVideoUrl={formData.videoUrl}
                  />

                  <div className="space-y-2">
                    <Label htmlFor="videoUrl">Ou insira URL do Vídeo manualmente</Label>
                    <Input
                      id="videoUrl"
                      type="url"
                      placeholder="https://..."
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    />
                    <p className="text-xs text-gray-500">
                      Você pode fazer upload de um vídeo acima ou inserir uma URL (YouTube, Vimeo, etc)
                    </p>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Criando..." : "Criar Aula"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {lessons.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  Nenhuma aula criada ainda. Clique em "Nova Aula" para começar.
                </CardContent>
              </Card>
            ) : (
              lessons.map((lesson, index) => (
                <Card key={lesson.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          Aula {index + 1}: {lesson.title}
                        </CardTitle>
                        {lesson.description && <CardDescription>{lesson.description}</CardDescription>}
                      </div>
                      <Link href={`/admin/courses/${resolvedParams.courseId}/lessons/${lesson.id}`}>
                        <Button variant="outline" size="sm">
                          <FileQuestion className="mr-2 h-4 w-4" />
                          Gerenciar Quizzes ({lesson.quizzes.length})
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{lesson.content.substring(0, 200)}...</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="finalExam">
          <Card>
            <CardHeader>
              <CardTitle>Prova Final do Curso</CardTitle>
              <CardDescription>Configure a avaliação final que os alunos farão</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/admin/courses/${resolvedParams.courseId}/final-exam`}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Configurar Prova Final
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
