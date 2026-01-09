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
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2, Users, Briefcase, Trash2, Edit, MoreVertical } from "lucide-react";
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

interface Company {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  _count: {
    employees: number;
    trainings: number;
    users: number;
  };
}

export default function AdminEmpresasPage() {
  const { toast } = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    cnpj: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await fetch("/api/admin/empresas");
      const data = await response.json();
      setCompanies(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar empresas",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/empresas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Empresa criada com sucesso!",
        });
        setIsOpen(false);
        setFormData({ name: "", cnpj: "", email: "", phone: "", address: "" });
        fetchCompanies();
      } else {
        throw new Error(data.error || "Erro ao criar empresa");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: error instanceof Error ? error.message : "Erro ao criar empresa",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/empresas/${selectedCompany.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Empresa atualizada com sucesso!",
        });
        setIsEditOpen(false);
        setSelectedCompany(null);
        fetchCompanies();
      } else {
        throw new Error(data.error || "Erro ao atualizar empresa");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: error instanceof Error ? error.message : "Erro ao atualizar empresa",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCompany) return;
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/empresas/${selectedCompany.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Empresa excluída com sucesso!",
        });
        setIsDeleteOpen(false);
        setSelectedCompany(null);
        fetchCompanies();
      } else {
        throw new Error("Erro ao excluir empresa");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir empresa",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (company: Company) => {
    setSelectedCompany(company);
    setFormData({
      name: company.name,
      cnpj: company.cnpj,
      email: company.email,
      phone: company.phone || "",
      address: company.address || "",
    });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (company: Company) => {
    setSelectedCompany(company);
    setIsDeleteOpen(true);
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .slice(0, 18);
  };

  return (
    <div>
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Empresas</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Gerencie as empresas cadastradas para treinamentos</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Nova Empresa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Cadastrar Nova Empresa</DialogTitle>
              <DialogDescription className="text-sm">Preencha as informações da empresa</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Empresa</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })}
                  placeholder="00.000.000/0000-00"
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

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="w-full sm:w-auto">
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading ? "Cadastrando..." : "Cadastrar Empresa"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Editar Empresa</DialogTitle>
            <DialogDescription className="text-sm">Atualize as informações da empresa</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome da Empresa</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-cnpj">CNPJ</Label>
              <Input
                id="edit-cnpj"
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })}
                placeholder="00.000.000/0000-00"
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

            <div className="space-y-2">
              <Label htmlFor="edit-phone">Telefone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-address">Endereço</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
            <AlertDialogTitle>Excluir Empresa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a empresa &quot;{selectedCompany?.name}&quot;?
              Esta ação não pode ser desfeita e excluirá todos os treinamentos e funcionários vinculados.
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
        {companies.map((company) => (
          <Card key={company.id} className="transition-shadow hover:shadow-lg">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <CardTitle className="text-base sm:text-lg truncate">{company.name}</CardTitle>
                  </div>
                  <CardDescription className="text-xs sm:text-sm">{company.cnpj}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={company.isActive ? "default" : "secondary"}>
                    {company.isActive ? "Ativo" : "Inativo"}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(company)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openDeleteDialog(company)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium truncate ml-2">{company.email}</span>
                </div>
                {company.phone && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Telefone:</span>
                    <span className="font-medium">{company.phone}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Funcionários:
                  </span>
                  <span className="font-medium">{company._count.users}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Treinamentos:
                  </span>
                  <span className="font-medium">{company._count.trainings}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {companies.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Nenhuma empresa cadastrada</h3>
          <p className="text-muted-foreground">Clique em &quot;Nova Empresa&quot; para cadastrar a primeira.</p>
        </div>
      )}
    </div>
  );
}
