"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import {
  Plus,
  Pencil,
  Trash2,
  Percent,
  DollarSign,
  Tag,
  Calendar,
  Users,
  BookOpen,
  X,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
}

interface CouponCourse {
  course: {
    id: string;
    title: string;
  };
}

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  maxUses: number | null;
  usedCount: number;
  minPurchase: number | null;
  validFrom: string;
  validUntil: string | null;
  isActive: boolean;
  appliesToAll: boolean;
  courses: CouponCourse[];
  createdAt: string;
  _count: {
    usages: number;
  };
}

interface FormData {
  code: string;
  description: string;
  discountType: string;
  discountValue: string;
  maxUses: string;
  minPurchase: string;
  validFrom: string;
  validUntil: string;
  courseIds: string[];
  appliesToAll: boolean;
  isActive: boolean;
}

const initialFormData: FormData = {
  code: "",
  description: "",
  discountType: "PERCENTAGE",
  discountValue: "",
  maxUses: "",
  minPurchase: "",
  validFrom: new Date().toISOString().split("T")[0],
  validUntil: "",
  courseIds: [],
  appliesToAll: true,
  isActive: true,
};

export default function AdminCouponsPage() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  useEffect(() => {
    fetchCoupons();
    fetchCourses();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await fetch("/api/admin/coupons");
      if (response.ok) {
        const data = await response.json();
        setCoupons(data);
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Erro ao carregar cupons",
      });
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses");
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch {
      console.error("Erro ao carregar cursos");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          courseIds: formData.appliesToAll ? [] : formData.courseIds,
        }),
      });

      if (response.ok) {
        toast({ title: "Cupom criado com sucesso!" });
        setIsCreateOpen(false);
        setFormData(initialFormData);
        fetchCoupons();
      } else {
        const data = await response.json();
        throw new Error(data.error);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        variant: "destructive",
        title: "Erro ao criar cupom",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoupon) return;
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/coupons/${selectedCoupon.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          courseIds: formData.appliesToAll ? [] : formData.courseIds,
        }),
      });

      if (response.ok) {
        toast({ title: "Cupom atualizado com sucesso!" });
        setIsEditOpen(false);
        setSelectedCoupon(null);
        setFormData(initialFormData);
        fetchCoupons();
      } else {
        const data = await response.json();
        throw new Error(data.error);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        variant: "destructive",
        title: "Erro ao atualizar cupom",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCoupon) return;
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/coupons/${selectedCoupon.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({ title: "Cupom excluido com sucesso!" });
        setIsDeleteOpen(false);
        setSelectedCoupon(null);
        fetchCoupons();
      } else {
        const data = await response.json();
        throw new Error(data.error);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        variant: "destructive",
        title: "Erro ao excluir cupom",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      const response = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });

      if (response.ok) {
        toast({
          title: coupon.isActive ? "Cupom desativado" : "Cupom ativado",
        });
        fetchCoupons();
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar cupom",
      });
    }
  };

  const openEditDialog = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || "",
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      maxUses: coupon.maxUses?.toString() || "",
      minPurchase: coupon.minPurchase?.toString() || "",
      validFrom: coupon.validFrom.split("T")[0],
      validUntil: coupon.validUntil?.split("T")[0] || "",
      courseIds: coupon.courses.map((c) => c.course.id),
      appliesToAll: coupon.appliesToAll,
      isActive: coupon.isActive,
    });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsDeleteOpen(true);
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discountType === "PERCENTAGE") {
      return `${coupon.discountValue}%`;
    }
    return `R$ ${coupon.discountValue.toFixed(2)}`;
  };

  const isExpired = (coupon: Coupon) => {
    if (!coupon.validUntil) return false;
    return new Date(coupon.validUntil) < new Date();
  };

  const isLimitReached = (coupon: Coupon) => {
    if (!coupon.maxUses) return false;
    return coupon.usedCount >= coupon.maxUses;
  };

  const toggleCourse = (courseId: string) => {
    setFormData((prev) => {
      const newCourseIds = prev.courseIds.includes(courseId)
        ? prev.courseIds.filter((id) => id !== courseId)
        : [...prev.courseIds, courseId];
      return { ...prev, courseIds: newCourseIds };
    });
  };

  const selectAllCourses = () => {
    setFormData((prev) => ({
      ...prev,
      courseIds: courses.map((c) => c.id),
    }));
  };

  const clearAllCourses = () => {
    setFormData((prev) => ({
      ...prev,
      courseIds: [],
    }));
  };

  const CouponForm = ({ onSubmit, submitLabel }: { onSubmit: (e: React.FormEvent) => void; submitLabel: string }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="code">Codigo do Cupom *</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            placeholder="EX: DESCONTO10"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="discountType">Tipo de Desconto *</Label>
          <Select
            value={formData.discountType}
            onValueChange={(value) => setFormData({ ...formData, discountType: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PERCENTAGE">
                <span className="flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  Porcentagem (%)
                </span>
              </SelectItem>
              <SelectItem value="FIXED">
                <span className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Valor Fixo (R$)
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="discountValue">
            Valor do Desconto *
            {formData.discountType === "PERCENTAGE" ? " (%)" : " (R$)"}
          </Label>
          <Input
            id="discountValue"
            type="number"
            step={formData.discountType === "PERCENTAGE" ? "1" : "0.01"}
            min="0"
            max={formData.discountType === "PERCENTAGE" ? "100" : undefined}
            value={formData.discountValue}
            onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
            placeholder={formData.discountType === "PERCENTAGE" ? "10" : "50.00"}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Aplicar a</Label>
          <div className="flex items-center space-x-2 h-10">
            <Switch
              id="appliesToAll"
              checked={formData.appliesToAll}
              onCheckedChange={(checked: boolean) => setFormData({ ...formData, appliesToAll: checked })}
            />
            <Label htmlFor="appliesToAll" className="text-sm">
              {formData.appliesToAll ? "Todos os cursos" : "Cursos selecionados"}
            </Label>
          </div>
        </div>
      </div>

      {/* Multi-select de cursos */}
      {!formData.appliesToAll && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Selecione os Cursos</Label>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={selectAllCourses}>
                Selecionar Todos
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={clearAllCourses}>
                Limpar
              </Button>
            </div>
          </div>
          <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
            {courses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum curso cadastrado
              </p>
            ) : (
              courses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center space-x-2 p-2 hover:bg-muted rounded cursor-pointer"
                  onClick={() => toggleCourse(course.id)}
                >
                  <Checkbox
                    id={`course-${course.id}`}
                    checked={formData.courseIds.includes(course.id)}
                    onCheckedChange={() => toggleCourse(course.id)}
                  />
                  <Label htmlFor={`course-${course.id}`} className="flex-1 cursor-pointer text-sm">
                    {course.title}
                  </Label>
                </div>
              ))
            )}
          </div>
          {formData.courseIds.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {formData.courseIds.length} curso(s) selecionado(s)
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="description">Descricao</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descricao do cupom (opcional)"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="validFrom">Valido a partir de</Label>
          <Input
            id="validFrom"
            type="date"
            value={formData.validFrom}
            onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="validUntil">Valido ate (opcional)</Label>
          <Input
            id="validUntil"
            type="date"
            value={formData.validUntil}
            onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="maxUses">Limite de usos (opcional)</Label>
          <Input
            id="maxUses"
            type="number"
            min="0"
            value={formData.maxUses}
            onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
            placeholder="Sem limite"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="minPurchase">Valor minimo de compra (opcional)</Label>
          <Input
            id="minPurchase"
            type="number"
            step="0.01"
            min="0"
            value={formData.minPurchase}
            onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
            placeholder="R$ 0,00"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked: boolean) => setFormData({ ...formData, isActive: checked })}
        />
        <Label htmlFor="isActive">Cupom ativo</Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setIsCreateOpen(false);
            setIsEditOpen(false);
            setFormData(initialFormData);
          }}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : submitLabel}
        </Button>
      </div>
    </form>
  );

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Cupons de Desconto</h1>
          <p className="text-gray-600 dark:text-gray-400">Gerencie os cupons de desconto da plataforma</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Cupom
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Cupom</DialogTitle>
              <DialogDescription>
                Configure o cupom de desconto. Pode ser em porcentagem ou valor fixo.
              </DialogDescription>
            </DialogHeader>
            <CouponForm onSubmit={handleCreate} submitLabel="Criar Cupom" />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cupons</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coupons.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cupons Ativos</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {coupons.filter((c) => c.isActive && !isExpired(c) && !isLimitReached(c)).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {coupons.reduce((acc, c) => acc + c.usedCount, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expirados</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {coupons.filter((c) => isExpired(c)).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coupons Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Codigo</TableHead>
                <TableHead>Desconto</TableHead>
                <TableHead>Aplicavel a</TableHead>
                <TableHead>Usos</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Nenhum cupom cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                coupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-primary" />
                        <span className="font-mono font-semibold">{coupon.code}</span>
                      </div>
                      {coupon.description && (
                        <p className="text-sm text-gray-500 mt-1">{coupon.description}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {coupon.discountType === "PERCENTAGE" ? (
                          <Percent className="h-4 w-4 text-blue-500" />
                        ) : (
                          <DollarSign className="h-4 w-4 text-green-500" />
                        )}
                        <span className="font-semibold">{formatDiscount(coupon)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {coupon.appliesToAll ? (
                        <Badge variant="secondary">Todos os cursos</Badge>
                      ) : coupon.courses.length === 0 ? (
                        <Badge variant="outline">Nenhum curso</Badge>
                      ) : coupon.courses.length === 1 ? (
                        <Badge variant="outline">{coupon.courses[0].course.title}</Badge>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline">
                            <BookOpen className="h-3 w-3 mr-1" />
                            {coupon.courses.length} cursos
                          </Badge>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{coupon.usedCount}</span>
                      {coupon.maxUses && (
                        <span className="text-gray-500">/{coupon.maxUses}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>
                          De: {new Date(coupon.validFrom).toLocaleDateString("pt-BR")}
                        </div>
                        {coupon.validUntil && (
                          <div className={isExpired(coupon) ? "text-red-500" : ""}>
                            Ate: {new Date(coupon.validUntil).toLocaleDateString("pt-BR")}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {isExpired(coupon) ? (
                        <Badge variant="destructive">Expirado</Badge>
                      ) : isLimitReached(coupon) ? (
                        <Badge variant="destructive">Limite atingido</Badge>
                      ) : coupon.isActive ? (
                        <Badge variant="default" className="bg-green-600">Ativo</Badge>
                      ) : (
                        <Badge variant="secondary">Inativo</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Switch
                          checked={coupon.isActive}
                          onCheckedChange={() => handleToggleActive(coupon)}
                          disabled={isExpired(coupon) || isLimitReached(coupon)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(coupon)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(coupon)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Cupom</DialogTitle>
            <DialogDescription>
              Atualize as configuracoes do cupom de desconto.
            </DialogDescription>
          </DialogHeader>
          <CouponForm onSubmit={handleEdit} submitLabel="Salvar Alteracoes" />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Cupom</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cupom{" "}
              <strong>{selectedCoupon?.code}</strong>? Esta acao nao pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
