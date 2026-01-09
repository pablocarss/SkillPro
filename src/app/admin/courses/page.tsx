"use client";

import { useState, useEffect } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Plus, BookOpen, Users, DollarSign } from "lucide-react";
import Link from "next/link";

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  duration: string;
  passingScore: number;
  price: number | null;
  createdBy: {
    name: string;
  };
  _count: {
    enrollments: number;
    modules: number;
  };
}

interface CertificateTemplate {
  id: string;
  name: string;
}

export default function AdminCoursesPage() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    level: "Iniciante",
    duration: "",
    passingScore: "70",
    certificateTemplateId: "NONE",
    price: "",
    isFree: true,
  });

  useEffect(() => {
    fetchCourses();
    fetchTemplates();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses");
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar cursos",
      });
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/admin/certificate-templates");
      const data = await response.json();
      // Garante que templates seja sempre um array
      setTemplates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching templates:", error);
      setTemplates([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Preparar dados para envio
      const submitData = {
        ...formData,
        price: formData.isFree ? null : parseFloat(formData.price),
      };

      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        toast({
          title: "Curso criado com sucesso!",
        });
        setIsOpen(false);
        setFormData({
          title: "",
          description: "",
          level: "Iniciante",
          duration: "",
          passingScore: "70",
          certificateTemplateId: "NONE",
          price: "",
          isFree: true,
        });
        fetchCourses();
      } else {
        throw new Error();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar curso",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Gerenciar Cursos</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Crie e gerencie os cursos da plataforma</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Novo Curso
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Criar Novo Curso</DialogTitle>
              <DialogDescription className="text-sm">Preencha as informações do curso</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm">Título do Curso</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm">Descrição</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  className="h-10"
                />
              </div>

              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="level" className="text-sm">Nível</Label>
                  <Input
                    id="level"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    required
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-sm">Duração</Label>
                  <Input
                    id="duration"
                    placeholder="Ex: 40 horas"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    required
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passingScore" className="text-sm">% Aprovação</Label>
                  <Input
                    id="passingScore"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.passingScore}
                    onChange={(e) => setFormData({ ...formData, passingScore: e.target.value })}
                    required
                    className="h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tipo de Curso</Label>
                <Select
                  value={formData.isFree ? "free" : "paid"}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      isFree: value === "free",
                      price: value === "free" ? "" : formData.price,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Gratuito</SelectItem>
                    <SelectItem value="paid">Pago</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!formData.isFree && (
                <div className="space-y-2">
                  <Label htmlFor="price">Valor do Curso (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Ex: 199.90"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required={!formData.isFree}
                  />
                  <p className="text-xs text-gray-500">
                    Valor que será cobrado do aluno para ter acesso ao curso
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="certificateTemplate">Template de Certificado (Opcional)</Label>
                <Select
                  value={formData.certificateTemplateId}
                  onValueChange={(value) => setFormData({ ...formData, certificateTemplateId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">Nenhum (usar padrão)</SelectItem>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Se não selecionado, o template padrão será usado
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="w-full sm:w-auto">
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading ? "Criando..." : "Criar Curso"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => (
          <Link key={course.id} href={`/admin/courses/${course.id}`}>
            <Card className="cursor-pointer transition-shadow hover:shadow-lg h-full">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base sm:text-lg truncate">{course.title}</CardTitle>
                  </div>
                  {course.price && course.price > 0 ? (
                    <Badge className="bg-green-500 hover:bg-green-600 text-white shrink-0 text-xs">
                      R$ {course.price.toFixed(2)}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="shrink-0 text-xs">Gratuito</Badge>
                  )}
                </div>
                <CardDescription className="text-xs sm:text-sm line-clamp-2">{course.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nível:</span>
                    <span className="font-medium">{course.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duração:</span>
                    <span className="font-medium">{course.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Módulos:
                    </span>
                    <span className="font-medium">{course._count.modules}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Alunos:
                    </span>
                    <span className="font-medium">{course._count.enrollments}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
