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
import { Plus, User, Building2, Briefcase, Trash2, Edit, MoreVertical, Award } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmployeeImportDialog } from "@/components/employee-import-dialog";

interface Company {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  cpf: string | null;
  phone: string | null;
  company: Company | null;
  trainingEnrollments: Array<{
    training: {
      id: string;
      title: string;
    };
  }>;
  trainingCertificates: Array<{ id: string }>;
}

export default function AdminFuncionariosPage() {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>("all");
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cpf: "",
    phone: "",
    companyId: "",
    password: "",
  });

  useEffect(() => {
    fetchCompanies();
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchEmployees();
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

  const fetchEmployees = async () => {
    try {
      let url = "/api/admin/funcionarios";
      if (selectedCompanyFilter && selectedCompanyFilter !== "all") {
        url += `?companyId=${selectedCompanyFilter}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar funcionários",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/funcionarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Funcionário criado com sucesso!",
          description: `Senha padrão: ${formData.password || "123456"}`,
        });
        setIsOpen(false);
        setFormData({ name: "", email: "", cpf: "", phone: "", companyId: "", password: "" });
        fetchEmployees();
      } else {
        throw new Error(data.error || "Erro ao criar funcionário");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: error instanceof Error ? error.message : "Erro ao criar funcionário",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/funcionarios/${selectedEmployee.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Funcionário atualizado com sucesso!",
        });
        setIsEditOpen(false);
        setSelectedEmployee(null);
        fetchEmployees();
      } else {
        throw new Error(data.error || "Erro ao atualizar funcionário");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: error instanceof Error ? error.message : "Erro ao atualizar funcionário",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEmployee) return;
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/funcionarios/${selectedEmployee.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Funcionário excluído com sucesso!",
        });
        setIsDeleteOpen(false);
        setSelectedEmployee(null);
        fetchEmployees();
      } else {
        throw new Error("Erro ao excluir funcionário");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir funcionário",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      cpf: employee.cpf || "",
      phone: employee.phone || "",
      companyId: employee.company?.id || "",
      password: "",
    });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDeleteOpen(true);
  };

  return (
    <div>
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Funcionários</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Gerencie os funcionários das empresas</p>
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
          <EmployeeImportDialog companies={companies} onSuccess={fetchEmployees} />

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Novo Funcionário
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">Cadastrar Novo Funcionário</DialogTitle>
                <DialogDescription className="text-sm">Preencha as informações do funcionário</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyId">Empresa</Label>
                  <Select
                    value={formData.companyId}
                    onValueChange={(value) => setFormData({ ...formData, companyId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      value={formData.cpf}
                      onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                      placeholder="000.000.000-00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha (opcional)</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Deixe vazio para usar 123456"
                  />
                  <p className="text-xs text-muted-foreground">Se não informada, será usado &quot;123456&quot; como senha padrão</p>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="w-full sm:w-auto">
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                    {isLoading ? "Cadastrando..." : "Cadastrar Funcionário"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Editar Funcionário</DialogTitle>
            <DialogDescription className="text-sm">Atualize as informações do funcionário</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-companyId">Empresa</Label>
              <Select
                value={formData.companyId}
                onValueChange={(value) => setFormData({ ...formData, companyId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a empresa" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome Completo</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-cpf">CPF</Label>
                <Input
                  id="edit-cpf"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-phone">Telefone</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-password">Nova Senha (opcional)</Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Deixe vazio para manter a atual"
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Funcionário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o funcionário &quot;{selectedEmployee?.name}&quot;?
              Esta ação não pode ser desfeita.
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

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead className="text-center">Treinamentos</TableHead>
                <TableHead className="text-center">Certificados</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{employee.company?.name || "Sem empresa"}</Badge>
                  </TableCell>
                  <TableCell className="text-center">{employee.trainingEnrollments.length}</TableCell>
                  <TableCell className="text-center">{employee.trainingCertificates.length}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(employee)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(employee)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden grid gap-4 grid-cols-1">
        {employees.map((employee) => (
          <Card key={employee.id}>
            <CardHeader className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-5 w-5 text-primary flex-shrink-0" />
                    <CardTitle className="text-base truncate">{employee.name}</CardTitle>
                  </div>
                  <CardDescription className="text-xs">{employee.email}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditDialog(employee)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => openDeleteDialog(employee)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{employee.company?.name || "Sem empresa"}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" />
                    {employee.trainingEnrollments.length} treinamentos
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="h-3.5 w-3.5" />
                    {employee.trainingCertificates.length} certificados
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {employees.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Nenhum funcionário cadastrado</h3>
          <p className="text-muted-foreground">Clique em &quot;Novo Funcionário&quot; para cadastrar o primeiro.</p>
        </div>
      )}
    </div>
  );
}
