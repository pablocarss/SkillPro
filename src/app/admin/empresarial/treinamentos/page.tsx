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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Plus, Briefcase, Users, BookOpen, Building2, Award, MoreVertical, Edit, Trash2, Link2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { trainingSchema } from "@/lib/validations";

interface Company {
  id: string;
  name: string;
}

interface TrainingCompany {
  id: string;
  company: Company;
}

interface Training {
  id: string;
  title: string;
  description: string;
  level: string | null;
  duration: string | null;
  passingScore: number;
  isPublished: boolean;
  company: Company | null;
  trainingCompanies: TrainingCompany[];
  createdBy: {
    name: string;
  };
  _count: {
    enrollments: number;
    modules: number;
    certificates: number;
    trainingCompanies: number;
  };
}

export default function AdminTreinamentosPage() {
  const { toast } = useToast();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>("all");
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    level: "Básico",
    duration: "",
    passingScore: "70",
    companyIds: [] as string[],
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCompanies();
    fetchTrainings();
  }, []);

  useEffect(() => {
    fetchTrainings();
  }, [selectedCompanyFilter]);

  const fetchCompanies = async () => {
    try {
      const response = await fetch("/api/admin/empresas");
      const data = await response.json();
      setCompanies(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar empresas:", error);
    }
  };

  const fetchTrainings = async () => {
    try {
      let url = "/api/admin/treinamentos";
      if (selectedCompanyFilter && selectedCompanyFilter !== "all") {
        url += `?companyId=${selectedCompanyFilter}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      setTrainings(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar treinamentos",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Validação com Zod
    const dataToValidate = {
      ...formData,
      passingScore: parseInt(formData.passingScore) || 0,
      level: formData.level as "Básico" | "Intermediário" | "Avançado",
    };

    const validation = trainingSchema.safeParse(dataToValidate);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setFormErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/treinamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Treinamento criado com sucesso!",
        });
        setIsOpen(false);
        setFormData({ title: "", description: "", level: "Básico", duration: "", passingScore: "70", companyIds: [] });
        setFormErrors({});
        fetchTrainings();
      } else {
        throw new Error(data.error || "Erro ao criar treinamento");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: error instanceof Error ? error.message : "Erro ao criar treinamento",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePublish = async (training: Training) => {
    try {
      const response = await fetch(`/api/admin/treinamentos/${training.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !training.isPublished }),
      });

      if (response.ok) {
        toast({
          title: training.isPublished ? "Treinamento despublicado!" : "Treinamento publicado!",
        });
        fetchTrainings();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao alterar status do treinamento",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedTraining) return;
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/treinamentos/${selectedTraining.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Treinamento excluído com sucesso!",
        });
        setIsDeleteOpen(false);
        setSelectedTraining(null);
        fetchTrainings();
      } else {
        throw new Error("Erro ao excluir treinamento");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir treinamento",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteDialog = (training: Training) => {
    setSelectedTraining(training);
    setIsDeleteOpen(true);
  };

  return (
    <div>
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Treinamentos</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Gerencie os treinamentos corporativos</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={selectedCompanyFilter} onValueChange={setSelectedCompanyFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filtrar por empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as empresas</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Novo Treinamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">Criar Novo Treinamento</DialogTitle>
                <DialogDescription className="text-sm">Preencha as informações do treinamento</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Empresas Vinculadas (opcional)</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Selecione as empresas que terão acesso a este treinamento. Você pode deixar vazio e vincular depois.
                  </p>
                  <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                    {companies.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Nenhuma empresa cadastrada</p>
                    ) : (
                      companies.map((company) => (
                        <div key={company.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`company-${company.id}`}
                            checked={formData.companyIds.includes(company.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({
                                  ...formData,
                                  companyIds: [...formData.companyIds, company.id],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  companyIds: formData.companyIds.filter((id) => id !== company.id),
                                });
                              }
                            }}
                          />
                          <label
                            htmlFor={`company-${company.id}`}
                            className="text-sm cursor-pointer"
                          >
                            {company.name}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                  {formData.companyIds.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {formData.companyIds.length} empresa(s) selecionada(s)
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Título do Treinamento</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={formErrors.title ? "border-destructive" : ""}
                  />
                  {formErrors.title && (
                    <p className="text-sm text-destructive">{formErrors.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className={formErrors.description ? "border-destructive" : ""}
                  />
                  {formErrors.description && (
                    <p className="text-sm text-destructive">{formErrors.description}</p>
                  )}
                </div>

                <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="level">Nível</Label>
                    <Select
                      value={formData.level}
                      onValueChange={(value) => setFormData({ ...formData, level: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Básico">Básico</SelectItem>
                        <SelectItem value="Intermediário">Intermediário</SelectItem>
                        <SelectItem value="Avançado">Avançado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duração</Label>
                    <Input
                      id="duration"
                      placeholder="Ex: 8 horas"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passingScore">% Aprovação</Label>
                    <Input
                      id="passingScore"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.passingScore}
                      onChange={(e) => setFormData({ ...formData, passingScore: e.target.value })}
                      className={formErrors.passingScore ? "border-destructive" : ""}
                    />
                    {formErrors.passingScore && (
                      <p className="text-sm text-destructive">{formErrors.passingScore}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="w-full sm:w-auto">
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                    {isLoading ? "Criando..." : "Criar Treinamento"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Treinamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o treinamento &quot;{selectedTraining?.title}&quot;?
              Esta ação não pode ser desfeita e excluirá todos os módulos, aulas e matrículas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isLoading ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        {trainings.map((training) => (
          <Card key={training.id} className="transition-shadow hover:shadow-lg">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={training.isPublished ? "default" : "secondary"}>
                      {training.isPublished ? "Publicado" : "Rascunho"}
                    </Badge>
                    {training.level && (
                      <Badge variant="outline">{training.level}</Badge>
                    )}
                  </div>
                  <CardTitle className="text-base sm:text-lg line-clamp-2">{training.title}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm line-clamp-2 mt-1">{training.description}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleTogglePublish(training)}>
                      {training.isPublished ? "Despublicar" : "Publicar"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => openDeleteDialog(training)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex items-start gap-2 text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                  <div className="flex flex-wrap gap-1">
                    {training.trainingCompanies.length > 0 ? (
                      training.trainingCompanies.slice(0, 2).map((tc) => (
                        <Badge key={tc.id} variant="outline" className="text-xs">
                          {tc.company.name}
                        </Badge>
                      ))
                    ) : training.company ? (
                      <Badge variant="outline" className="text-xs">
                        {training.company.name}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground italic">Nenhuma empresa</span>
                    )}
                    {training._count.trainingCompanies > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{training._count.trainingCompanies - 2}
                      </Badge>
                    )}
                  </div>
                </div>
                {training.duration && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duração:</span>
                    <span className="font-medium">{training.duration}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Aprovação:</span>
                  <span className="font-medium">{training.passingScore}%</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <BookOpen className="h-3.5 w-3.5" />
                    Módulos:
                  </span>
                  <span className="font-medium">{training._count.modules}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    Matrículas:
                  </span>
                  <span className="font-medium">{training._count.enrollments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Award className="h-3.5 w-3.5" />
                    Certificados:
                  </span>
                  <span className="font-medium">{training._count.certificates}</span>
                </div>
              </div>
              <div className="mt-4">
                <Link href={`/admin/empresarial/treinamentos/${training.id}`}>
                  <Button variant="outline" className="w-full">
                    <Edit className="mr-2 h-4 w-4" />
                    Gerenciar Conteúdo
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {trainings.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Nenhum treinamento cadastrado</h3>
          <p className="text-muted-foreground">Clique em &quot;Novo Treinamento&quot; para criar o primeiro.</p>
        </div>
      )}
    </div>
  );
}
