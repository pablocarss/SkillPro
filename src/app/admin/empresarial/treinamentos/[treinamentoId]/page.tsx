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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  BookOpen,
  Users,
  ChevronDown,
  ChevronRight,
  Edit,
  Trash2,
  ArrowLeft,
  Video,
  FileText,
  Building2,
  UserPlus,
  Check,
  Link2,
  Upload,
  Award,
  UsersRound,
  Globe,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { VideoUpload } from "@/components/video-upload";
import { TrainingMaterialUpload } from "@/components/training-material-upload";
import { moduleSchema, lessonSchema } from "@/lib/validations";

interface Material {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileType: string;
  fileSize: number | null;
  isExternal: boolean;
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  content: string;
  videoUrl: string | null;
  order: number;
  materials?: Material[];
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  order: number;
  lessons: Lesson[];
}

interface TrainingCompany {
  id: string;
  company: {
    id: string;
    name: string;
    cnpj: string;
    _count: {
      users: number;
    };
  };
}

interface CertificateTemplate {
  id: string;
  templateUrl: string;
  name: string | null;
  company: {
    id: string;
    name: string;
  };
}

interface Training {
  id: string;
  title: string;
  description: string;
  level: string | null;
  duration: string | null;
  passingScore: number;
  isPublished: boolean;
  company: {
    id: string;
    name: string;
  } | null;
  trainingCompanies: TrainingCompany[];
  certificateTemplates: CertificateTemplate[];
  modules: Module[];
  enrollments: Array<{
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
      companyId: string | null;
      company: {
        id: string;
        name: string;
      } | null;
    };
  }>;
  _count: {
    enrollments: number;
    modules: number;
    certificates: number;
    trainingCompanies: number;
  };
}

interface Employee {
  id: string;
  name: string;
  email: string;
  companyId: string | null;
  company: {
    id: string;
    name: string;
  } | null;
}

interface Company {
  id: string;
  name: string;
  cnpj: string;
  _count?: {
    users: number;
  };
}

export default function TrainingDetailPage({ params }: { params: Promise<{ treinamentoId: string }> }) {
  const resolvedParams = use(params);
  const { toast } = useToast();
  const [training, setTraining] = useState<Training | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>("all");
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [isCompaniesDialogOpen, setIsCompaniesDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isDeleteModuleOpen, setIsDeleteModuleOpen] = useState(false);
  const [isDeleteLessonOpen, setIsDeleteLessonOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedCompanyForTemplate, setSelectedCompanyForTemplate] = useState<string>("");
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [moduleForm, setModuleForm] = useState({ title: "", description: "" });
  const [lessonForm, setLessonForm] = useState({
    title: "",
    description: "",
    content: "",
    videoUrl: "",
  });
  const [videoInputType, setVideoInputType] = useState<"url" | "upload">("url");
  const [moduleErrors, setModuleErrors] = useState<Record<string, string>>({});
  const [lessonErrors, setLessonErrors] = useState<Record<string, string>>({});
  const [isMaterialsDialogOpen, setIsMaterialsDialogOpen] = useState(false);
  const [selectedLessonForMaterials, setSelectedLessonForMaterials] = useState<Lesson | null>(null);
  const [lessonMaterials, setLessonMaterials] = useState<Material[]>([]);

  useEffect(() => {
    fetchTraining();
    fetchEmployees();
    fetchCompanies();
  }, [resolvedParams.treinamentoId]);

  const fetchTraining = async () => {
    try {
      const response = await fetch(`/api/admin/treinamentos/${resolvedParams.treinamentoId}`);
      const data = await response.json();
      setTraining(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar treinamento",
      });
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/admin/funcionarios");
      const data = await response.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar funcionários:", error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await fetch("/api/admin/empresas");
      const data = await response.json();
      setAllCompanies(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar empresas:", error);
    }
  };

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    setModuleErrors({});

    // Validação com Zod
    const validation = moduleSchema.safeParse(moduleForm);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setModuleErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/treinamentos/${resolvedParams.treinamentoId}/modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(moduleForm),
      });

      if (response.ok) {
        toast({ title: "Módulo criado com sucesso!" });
        setIsModuleDialogOpen(false);
        setModuleForm({ title: "", description: "" });
        setModuleErrors({});
        fetchTraining();
      } else {
        throw new Error("Erro ao criar módulo");
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
    if (!selectedModule) return;
    setLessonErrors({});

    // Validação com Zod
    const validation = lessonSchema.safeParse(lessonForm);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setLessonErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/admin/treinamentos/${resolvedParams.treinamentoId}/modules/${selectedModule.id}/lessons`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(lessonForm),
        }
      );

      if (response.ok) {
        toast({ title: "Aula criada com sucesso!" });
        setIsLessonDialogOpen(false);
        setLessonForm({ title: "", description: "", content: "", videoUrl: "" });
        setSelectedModule(null);
        setLessonErrors({});
        setVideoInputType("url");
        fetchTraining();
      } else {
        throw new Error("Erro ao criar aula");
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

  const handleDeleteModule = async () => {
    if (!selectedModule) return;
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/admin/treinamentos/${resolvedParams.treinamentoId}/modules/${selectedModule.id}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        toast({ title: "Módulo excluído com sucesso!" });
        setIsDeleteModuleOpen(false);
        setSelectedModule(null);
        fetchTraining();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir módulo",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLesson = async () => {
    if (!selectedLesson || !selectedModule) return;
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/admin/treinamentos/${resolvedParams.treinamentoId}/modules/${selectedModule.id}/lessons/${selectedLesson.id}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        toast({ title: "Aula excluída com sucesso!" });
        setIsDeleteLessonOpen(false);
        setSelectedLesson(null);
        setSelectedModule(null);
        fetchTraining();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir aula",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnrollEmployees = async () => {
    if (selectedEmployees.length === 0) {
      toast({
        variant: "destructive",
        title: "Selecione pelo menos um funcionário",
      });
      return;
    }
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/admin/treinamentos/${resolvedParams.treinamentoId}/enrollments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userIds: selectedEmployees }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast({ title: data.message });
        setIsEnrollDialogOpen(false);
        setSelectedEmployees([]);
        fetchTraining();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao matricular funcionários",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveEnrollment = async (enrollmentId: string) => {
    try {
      const response = await fetch(
        `/api/admin/treinamentos/${resolvedParams.treinamentoId}/enrollments?enrollmentId=${enrollmentId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        toast({ title: "Matrícula removida com sucesso!" });
        fetchTraining();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao remover matrícula",
      });
    }
  };

  const openLessonDialog = (module: Module) => {
    setSelectedModule(module);
    setLessonForm({ title: "", description: "", content: "", videoUrl: "" });
    setLessonErrors({});
    setVideoInputType("url");
    setIsLessonDialogOpen(true);
  };

  const openDeleteModuleDialog = (module: Module) => {
    setSelectedModule(module);
    setIsDeleteModuleOpen(true);
  };

  const openDeleteLessonDialog = (module: Module, lesson: Lesson) => {
    setSelectedModule(module);
    setSelectedLesson(lesson);
    setIsDeleteLessonOpen(true);
  };

  // Abrir diálogo de materiais
  const openMaterialsDialog = async (lesson: Lesson) => {
    setSelectedLessonForMaterials(lesson);
    setIsMaterialsDialogOpen(true);

    // Buscar materiais da aula
    try {
      const response = await fetch(`/api/training-lessons/${lesson.id}/materials`);
      if (response.ok) {
        const materials = await response.json();
        setLessonMaterials(materials);
      }
    } catch (error) {
      console.error("Erro ao buscar materiais:", error);
      setLessonMaterials([]);
    }
  };

  const handleMaterialsUpdate = async () => {
    if (!selectedLessonForMaterials) return;

    try {
      const response = await fetch(`/api/training-lessons/${selectedLessonForMaterials.id}/materials`);
      if (response.ok) {
        const materials = await response.json();
        setLessonMaterials(materials);
      }
    } catch (error) {
      console.error("Erro ao atualizar materiais:", error);
    }
  };

  // Vincular empresa ao treinamento
  const handleLinkCompany = async (companyId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/treinamentos/${resolvedParams.treinamentoId}/companies`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ companyIds: [companyId] }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        toast({ title: "Empresa vinculada com sucesso!" });
        fetchTraining();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao vincular empresa",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Desvincular empresa do treinamento
  const handleUnlinkCompany = async (companyId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/treinamentos/${resolvedParams.treinamentoId}/companies?companyId=${companyId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        toast({ title: "Empresa desvinculada com sucesso!" });
        fetchTraining();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao desvincular empresa",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Upload de template de certificado
  const handleUploadTemplate = async () => {
    if (!templateFile || !selectedCompanyForTemplate) {
      toast({
        variant: "destructive",
        title: "Selecione uma empresa e um arquivo",
      });
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", templateFile);
      formData.append("companyId", selectedCompanyForTemplate);

      const response = await fetch(
        `/api/admin/treinamentos/${resolvedParams.treinamentoId}/certificate-templates`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      if (response.ok) {
        toast({ title: "Template salvo com sucesso!" });
        setIsTemplateDialogOpen(false);
        setTemplateFile(null);
        setSelectedCompanyForTemplate("");
        fetchTraining();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer upload do template",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Remover template de certificado
  const handleRemoveTemplate = async (companyId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/treinamentos/${resolvedParams.treinamentoId}/certificate-templates?companyId=${companyId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        toast({ title: "Template removido com sucesso!" });
        fetchTraining();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao remover template",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Matricular todos de uma empresa
  const handleEnrollAllFromCompany = async (companyId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/treinamentos/${resolvedParams.treinamentoId}/enrollments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ companyId, enrollAll: true }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        toast({ title: data.message });
        fetchTraining();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao matricular funcionários",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Obter IDs das empresas vinculadas
  const linkedCompanyIds = training?.trainingCompanies.map((tc) => tc.company.id) || [];
  if (training?.company?.id) {
    linkedCompanyIds.push(training.company.id);
  }

  // Empresas disponíveis para vincular
  const availableCompanies = allCompanies.filter(
    (c) => !linkedCompanyIds.includes(c.id)
  );

  // Filtrar funcionários das empresas vinculadas que ainda não estão matriculados
  const enrolledUserIds = training?.enrollments.map((e) => e.user.id) || [];
  const availableEmployees = employees.filter((emp) => {
    const isFromLinkedCompany = emp.companyId && linkedCompanyIds.includes(emp.companyId);
    const notEnrolled = !enrolledUserIds.includes(emp.id);
    const matchesFilter = selectedCompanyFilter === "all" || emp.companyId === selectedCompanyFilter;
    return isFromLinkedCompany && notEnrolled && matchesFilter;
  });

  if (!training) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <Link
          href="/admin/empresarial/treinamentos"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar aos treinamentos
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={training.isPublished ? "default" : "secondary"}>
                {training.isPublished ? "Publicado" : "Rascunho"}
              </Badge>
              {training.level && <Badge variant="outline">{training.level}</Badge>}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{training.title}</h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              {training.trainingCompanies.length > 0 ? (
                <>
                  {training.trainingCompanies.slice(0, 3).map((tc) => (
                    <Badge key={tc.id} variant="outline" className="text-xs">
                      {tc.company.name}
                    </Badge>
                  ))}
                  {training._count.trainingCompanies > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{training._count.trainingCompanies - 3}
                    </Badge>
                  )}
                </>
              ) : training.company ? (
                <Badge variant="outline" className="text-xs">{training.company.name}</Badge>
              ) : (
                <span className="text-sm text-muted-foreground italic">Nenhuma empresa vinculada</span>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2"
                onClick={() => setIsCompaniesDialogOpen(true)}
              >
                <Link2 className="h-3 w-3 mr-1" />
                Gerenciar
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/admin/empresarial/treinamentos/${resolvedParams.treinamentoId}/prova-final`}>
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Prova Final
              </Button>
            </Link>
            <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Matricular Funcionários
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Matricular Funcionários</DialogTitle>
                  <DialogDescription>
                    Selecione funcionários das empresas vinculadas para matricular neste treinamento.
                  </DialogDescription>
                </DialogHeader>

                {linkedCompanyIds.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">
                    Nenhuma empresa vinculada a este treinamento.
                  </p>
                ) : (
                  <>
                    <div className="flex flex-col sm:flex-row gap-2 mb-4">
                      <Select value={selectedCompanyFilter} onValueChange={setSelectedCompanyFilter}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Filtrar por empresa" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas as empresas</SelectItem>
                          {training.trainingCompanies.map((tc) => (
                            <SelectItem key={tc.company.id} value={tc.company.id}>
                              {tc.company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedCompanyFilter !== "all" && (
                        <Button
                          variant="secondary"
                          onClick={() => handleEnrollAllFromCompany(selectedCompanyFilter)}
                          disabled={isLoading}
                        >
                          <UsersRound className="mr-2 h-4 w-4" />
                          Matricular Todos
                        </Button>
                      )}
                    </div>

                    {availableEmployees.length === 0 ? (
                      <p className="text-center py-4 text-muted-foreground">
                        Todos os funcionários já estão matriculados.
                      </p>
                    ) : (
                      <div className="space-y-3 max-h-[300px] overflow-y-auto">
                        {availableEmployees.map((employee) => (
                          <div
                            key={employee.id}
                            className="flex items-center space-x-3 p-2 rounded hover:bg-muted"
                          >
                            <Checkbox
                              id={employee.id}
                              checked={selectedEmployees.includes(employee.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedEmployees([...selectedEmployees, employee.id]);
                                } else {
                                  setSelectedEmployees(selectedEmployees.filter((id) => id !== employee.id));
                                }
                              }}
                            />
                            <label htmlFor={employee.id} className="flex-1 cursor-pointer">
                              <p className="font-medium text-sm">{employee.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {employee.email}
                                {employee.company && (
                                  <span className="ml-2 text-muted-foreground">({employee.company.name})</span>
                                )}
                              </p>
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsEnrollDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleEnrollEmployees}
                    disabled={selectedEmployees.length === 0 || isLoading}
                  >
                    {isLoading ? "Matriculando..." : `Matricular (${selectedEmployees.length})`}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

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
                  <DialogDescription>Adicione um módulo ao treinamento</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateModule} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="module-title">Título do Módulo</Label>
                    <Input
                      id="module-title"
                      value={moduleForm.title}
                      onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                      className={moduleErrors.title ? "border-destructive" : ""}
                    />
                    {moduleErrors.title && (
                      <p className="text-sm text-destructive">{moduleErrors.title}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="module-description">Descrição (opcional)</Label>
                    <Textarea
                      id="module-description"
                      value={moduleForm.description}
                      onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                      rows={2}
                      className={moduleErrors.description ? "border-destructive" : ""}
                    />
                    {moduleErrors.description && (
                      <p className="text-sm text-destructive">{moduleErrors.description}</p>
                    )}
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
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Módulos</span>
            </div>
            <p className="text-2xl font-bold">{training._count.modules}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Aulas</span>
            </div>
            <p className="text-2xl font-bold">
              {training.modules.reduce((acc, m) => acc + m.lessons.length, 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Matriculados</span>
            </div>
            <p className="text-2xl font-bold">{training._count.enrollments}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Aprovação</span>
            </div>
            <p className="text-2xl font-bold">{training.passingScore}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Modules and Lessons */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Conteúdo do Treinamento</CardTitle>
              <CardDescription>Gerencie módulos e aulas</CardDescription>
            </CardHeader>
            <CardContent>
              {training.modules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum módulo criado ainda.</p>
                  <p className="text-sm">Clique em &quot;Novo Módulo&quot; para começar.</p>
                </div>
              ) : (
                <Accordion type="multiple" className="w-full">
                  {training.modules.map((module) => (
                    <AccordionItem key={module.id} value={module.id}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <span className="font-medium">{module.title}</span>
                          <Badge variant="secondary" className="ml-2">
                            {module.lessons.length} aulas
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pl-4">
                          {module.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between p-2 rounded hover:bg-muted group"
                            >
                              <div className="flex items-center gap-2">
                                {lesson.videoUrl ? (
                                  <Video className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span className="text-sm">{lesson.title}</span>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2"
                                  onClick={() => openMaterialsDialog(lesson)}
                                >
                                  <FileText className="h-4 w-4 mr-1" />
                                  Materiais
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => openDeleteLessonDialog(module, lesson)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => openLessonDialog(module)}
                            >
                              <Plus className="mr-2 h-3 w-3" />
                              Adicionar Aula
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteModuleDialog(module)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Enrolled Employees */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Funcionários Matriculados</CardTitle>
              <CardDescription>{training.enrollments.length} matriculados</CardDescription>
            </CardHeader>
            <CardContent>
              {training.enrollments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum funcionário matriculado.
                </p>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {training.enrollments.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="flex items-center justify-between p-2 rounded hover:bg-muted group"
                    >
                      <div>
                        <p className="text-sm font-medium">{enrollment.user.name}</p>
                        <p className="text-xs text-muted-foreground">{enrollment.user.email}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100"
                        onClick={() => handleRemoveEnrollment(enrollment.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Lesson Dialog */}
      <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Nova Aula</DialogTitle>
            <DialogDescription>
              Adicione uma aula ao módulo: {selectedModule?.title}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateLesson} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lesson-title">Título da Aula</Label>
              <Input
                id="lesson-title"
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                className={lessonErrors.title ? "border-destructive" : ""}
              />
              {lessonErrors.title && (
                <p className="text-sm text-destructive">{lessonErrors.title}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lesson-description">Descrição (opcional)</Label>
              <Textarea
                id="lesson-description"
                value={lessonForm.description}
                onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                rows={2}
                className={lessonErrors.description ? "border-destructive" : ""}
              />
              {lessonErrors.description && (
                <p className="text-sm text-destructive">{lessonErrors.description}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lesson-content">Conteúdo</Label>
              <Textarea
                id="lesson-content"
                value={lessonForm.content}
                onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                rows={6}
                className={lessonErrors.content ? "border-destructive" : ""}
              />
              {lessonErrors.content && (
                <p className="text-sm text-destructive">{lessonErrors.content}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Vídeo (opcional)</Label>
              <Tabs value={videoInputType} onValueChange={(v) => setVideoInputType(v as "url" | "upload")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="url" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    URL Externa
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="url" className="mt-3">
                  <div className="space-y-2">
                    <Input
                      id="lesson-video"
                      value={lessonForm.videoUrl}
                      onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                      placeholder="https://youtube.com/watch?v=... ou https://vimeo.com/..."
                      className={lessonErrors.videoUrl ? "border-destructive" : ""}
                    />
                    <p className="text-xs text-muted-foreground">
                      Suporta YouTube, Vimeo, Dailymotion, Wistia e Loom
                    </p>
                    {lessonErrors.videoUrl && (
                      <p className="text-sm text-destructive">{lessonErrors.videoUrl}</p>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="upload" className="mt-3">
                  <VideoUpload
                    onVideoUploaded={(url) => setLessonForm({ ...lessonForm, videoUrl: url })}
                    currentVideoUrl={lessonForm.videoUrl}
                  />
                </TabsContent>
              </Tabs>
              {lessonForm.videoUrl && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  <Video className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">Vídeo configurado</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-auto h-6 px-2"
                    onClick={() => setLessonForm({ ...lessonForm, videoUrl: "" })}
                  >
                    Remover
                  </Button>
                </div>
              )}
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

      {/* Delete Module Dialog */}
      <AlertDialog open={isDeleteModuleOpen} onOpenChange={setIsDeleteModuleOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Módulo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o módulo &quot;{selectedModule?.title}&quot;?
              Todas as aulas deste módulo também serão excluídas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteModule}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Lesson Dialog */}
      <AlertDialog open={isDeleteLessonOpen} onOpenChange={setIsDeleteLessonOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Aula</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a aula &quot;{selectedLesson?.title}&quot;?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLesson}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Companies Management Dialog */}
      <Dialog open={isCompaniesDialogOpen} onOpenChange={setIsCompaniesDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerenciar Empresas Vinculadas</DialogTitle>
            <DialogDescription>
              Vincule ou desvincule empresas deste treinamento. Cada empresa pode ter seu template de certificado.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="linked" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="linked">Vinculadas ({training.trainingCompanies.length})</TabsTrigger>
              <TabsTrigger value="available">Disponíveis ({availableCompanies.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="linked" className="space-y-4">
              {training.trainingCompanies.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  Nenhuma empresa vinculada. Adicione empresas na aba &quot;Disponíveis&quot;.
                </p>
              ) : (
                <div className="space-y-3">
                  {training.trainingCompanies.map((tc) => {
                    const template = training.certificateTemplates.find(
                      (t) => t.company.id === tc.company.id
                    );
                    return (
                      <div
                        key={tc.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{tc.company.name}</p>
                          <p className="text-xs text-muted-foreground">
                            CNPJ: {tc.company.cnpj} | {tc.company._count.users} funcionários
                          </p>
                          {template ? (
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                <Award className="h-3 w-3 mr-1" />
                                Template: {template.name || "Configurado"}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-destructive"
                                onClick={() => handleRemoveTemplate(tc.company.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 mt-1"
                              onClick={() => {
                                setSelectedCompanyForTemplate(tc.company.id);
                                setIsTemplateDialogOpen(true);
                              }}
                            >
                              <Upload className="h-3 w-3 mr-1" />
                              Adicionar Template
                            </Button>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUnlinkCompany(tc.company.id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="available" className="space-y-4">
              {availableCompanies.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  Todas as empresas já estão vinculadas.
                </p>
              ) : (
                <div className="space-y-3">
                  {availableCompanies.map((company) => (
                    <div
                      key={company.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{company.name}</p>
                        <p className="text-xs text-muted-foreground">CNPJ: {company.cnpj}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLinkCompany(company.id)}
                        disabled={isLoading}
                      >
                        <Link2 className="h-4 w-4 mr-2" />
                        Vincular
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => setIsCompaniesDialogOpen(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Upload Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload de Template de Certificado</DialogTitle>
            <DialogDescription>
              Faça upload de um arquivo .docx que será usado como template de certificado para esta empresa.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Empresa</Label>
              <Select
                value={selectedCompanyForTemplate}
                onValueChange={setSelectedCompanyForTemplate}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a empresa" />
                </SelectTrigger>
                <SelectContent>
                  {training.trainingCompanies.map((tc) => (
                    <SelectItem key={tc.company.id} value={tc.company.id}>
                      {tc.company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-file">Arquivo (.docx)</Label>
              <Input
                id="template-file"
                type="file"
                accept=".docx"
                onChange={(e) => setTemplateFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-muted-foreground">
                O template deve ser um arquivo Word (.docx) com placeholders para os dados do certificado.
              </p>
            </div>

            {/* Template Variables Documentation */}
            <div className="space-y-2 border rounded-lg p-4 bg-muted/50">
              <Label className="text-sm font-semibold">Variáveis Disponíveis</Label>
              <p className="text-xs text-muted-foreground mb-3">
                Use estas variáveis no seu template Word entre chaves, ex: {"{nome}"}, {"{empresa}"}
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <div className="font-medium text-primary">Dados do Funcionário:</div>
                <div></div>
                <code className="bg-background px-1 rounded">{"{nome}"}</code>
                <span className="text-muted-foreground">Nome completo</span>
                <code className="bg-background px-1 rounded">{"{cpf}"}</code>
                <span className="text-muted-foreground">CPF</span>
                <code className="bg-background px-1 rounded">{"{email}"}</code>
                <span className="text-muted-foreground">E-mail</span>
                <code className="bg-background px-1 rounded">{"{empresa_funcionario}"}</code>
                <span className="text-muted-foreground">Empresa do funcionário</span>
                <code className="bg-background px-1 rounded">{"{cnpj_funcionario}"}</code>
                <span className="text-muted-foreground">CNPJ da empresa</span>

                <div className="font-medium text-primary mt-2">Dados do Treinamento:</div>
                <div></div>
                <code className="bg-background px-1 rounded">{"{treinamento}"}</code>
                <span className="text-muted-foreground">Nome do treinamento</span>
                <code className="bg-background px-1 rounded">{"{descricao}"}</code>
                <span className="text-muted-foreground">Descrição</span>
                <code className="bg-background px-1 rounded">{"{carga_horaria}"}</code>
                <span className="text-muted-foreground">Carga horária</span>
                <code className="bg-background px-1 rounded">{"{nivel}"}</code>
                <span className="text-muted-foreground">Nível</span>
                <code className="bg-background px-1 rounded">{"{empresa}"}</code>
                <span className="text-muted-foreground">Empresa que oferece</span>
                <code className="bg-background px-1 rounded">{"{cnpj}"}</code>
                <span className="text-muted-foreground">CNPJ da empresa</span>

                <div className="font-medium text-primary mt-2">Datas:</div>
                <div></div>
                <code className="bg-background px-1 rounded">{"{data}"}</code>
                <span className="text-muted-foreground">Data por extenso</span>
                <code className="bg-background px-1 rounded">{"{data_curta}"}</code>
                <span className="text-muted-foreground">DD/MM/AAAA</span>
                <code className="bg-background px-1 rounded">{"{dia}"}</code>
                <span className="text-muted-foreground">Dia</span>
                <code className="bg-background px-1 rounded">{"{mes}"}</code>
                <span className="text-muted-foreground">Mês por extenso</span>
                <code className="bg-background px-1 rounded">{"{ano}"}</code>
                <span className="text-muted-foreground">Ano</span>

                <div className="font-medium text-primary mt-2">Desempenho:</div>
                <div></div>
                <code className="bg-background px-1 rounded">{"{nota}"}</code>
                <span className="text-muted-foreground">Nota (ex: 85.5)</span>
                <code className="bg-background px-1 rounded">{"{nota_inteiro}"}</code>
                <span className="text-muted-foreground">Nota inteira (ex: 86)</span>

                <div className="font-medium text-primary mt-2">Verificação:</div>
                <div></div>
                <code className="bg-background px-1 rounded">{"{hash}"}</code>
                <span className="text-muted-foreground">Código de verificação</span>
                <code className="bg-background px-1 rounded">{"{url_verificacao}"}</code>
                <span className="text-muted-foreground">URL de verificação</span>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleUploadTemplate}
              disabled={!templateFile || !selectedCompanyForTemplate || isLoading}
            >
              {isLoading ? "Enviando..." : "Enviar Template"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Materials Dialog */}
      <Dialog open={isMaterialsDialogOpen} onOpenChange={setIsMaterialsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Materiais de Apoio</DialogTitle>
            <DialogDescription>
              Gerencie os materiais de apoio da aula: {selectedLessonForMaterials?.title}
            </DialogDescription>
          </DialogHeader>
          {selectedLessonForMaterials && (
            <TrainingMaterialUpload
              lessonId={selectedLessonForMaterials.id}
              materials={lessonMaterials}
              onMaterialAdded={handleMaterialsUpdate}
              onMaterialDeleted={handleMaterialsUpdate}
            />
          )}
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => setIsMaterialsDialogOpen(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
