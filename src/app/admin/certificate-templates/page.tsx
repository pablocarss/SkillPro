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
import { Plus, FileText, Trash2, CheckCircle, Upload } from "lucide-react";
import Link from "next/link";

interface CertificateTemplate {
  id: string;
  name: string;
  description: string | null;
  templateUrl: string;
  isDefault: boolean;
  createdAt: string;
}

export default function CertificateTemplatesPage() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/admin/certificate-templates");
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar templates",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith(".docx")) {
        toast({
          variant: "destructive",
          title: "Formato inválido",
          description: "Por favor, selecione um arquivo .docx",
        });
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 10MB",
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast({
        variant: "destructive",
        title: "Selecione um arquivo",
      });
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    try {
      // Upload the template file
      const uploadFormData = new FormData();
      uploadFormData.append("file", selectedFile);
      uploadFormData.append("name", formData.name);
      uploadFormData.append("description", formData.description);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploadProgress(progress);
        }
      });

      const uploadPromise = new Promise((resolve, reject) => {
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error("Upload failed"));
          }
        });
        xhr.addEventListener("error", () => reject(new Error("Upload failed")));
        xhr.open("POST", "/api/admin/certificate-templates");
        xhr.send(uploadFormData);
      });

      await uploadPromise;

      toast({
        title: "Template criado com sucesso!",
      });

      setIsDialogOpen(false);
      setFormData({ name: "", description: "" });
      setSelectedFile(null);
      setUploadProgress(0);
      fetchTemplates();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar template",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefault = async (templateId: string) => {
    try {
      const response = await fetch(`/api/admin/certificate-templates/${templateId}/set-default`, {
        method: "PATCH",
      });

      if (response.ok) {
        toast({
          title: "Template padrão atualizado!",
        });
        fetchTemplates();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar template",
      });
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm("Tem certeza que deseja excluir este template?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/certificate-templates/${templateId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Template excluído com sucesso!",
        });
        fetchTemplates();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir template",
      });
    }
  };

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin" className="text-sm text-gray-600 hover:text-primary">
          ← Voltar para Admin
        </Link>
        <div className="mt-2 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Templates de Certificado</h1>
            <p className="text-gray-600">Gerencie os modelos de certificados disponíveis</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Template</DialogTitle>
                <DialogDescription>
                  Faça upload de um arquivo .docx com variáveis: {"{"}nome{"}"}, {"{"}cpf{"}"}, {"{"}curso{"}"}, {"{"}carga_horaria{"}"}, {"{"}data{"}"}, {"{"}nota{"}"}, {"{"}hash{"}"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTemplate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Template</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  <Label htmlFor="template-file">Arquivo do Template (.docx)</Label>
                  <Input
                    id="template-file"
                    type="file"
                    accept=".docx"
                    onChange={handleFileChange}
                    required
                  />
                  {selectedFile && (
                    <p className="text-sm text-gray-600">
                      Selecionado: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                    </p>
                  )}
                </div>

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 text-center">{uploadProgress.toFixed(0)}%</p>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Enviando..." : "Criar Template"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-4">
        {templates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-500">
                Nenhum template criado ainda. Clique em "Novo Template" para começar.
              </p>
            </CardContent>
          </Card>
        ) : (
          templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle>{template.name}</CardTitle>
                      {template.isDefault && (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Padrão
                        </span>
                      )}
                    </div>
                    {template.description && (
                      <CardDescription className="mt-1">{template.description}</CardDescription>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                      Criado em: {new Date(template.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!template.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(template.id)}
                      >
                        Definir como Padrão
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(template.templateUrl, "_blank")}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Baixar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(template.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Como usar variáveis no template</CardTitle>
          <CardDescription>
            Use as seguintes variáveis no seu arquivo .docx Word. Elas serão substituídas automaticamente:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <code className="rounded bg-gray-100 px-2 py-1">{"{"}nome{"}"}</code>
              <p className="mt-1 text-gray-600">Nome completo do aluno</p>
            </div>
            <div>
              <code className="rounded bg-gray-100 px-2 py-1">{"{"}cpf{"}"}</code>
              <p className="mt-1 text-gray-600">CPF do aluno</p>
            </div>
            <div>
              <code className="rounded bg-gray-100 px-2 py-1">{"{"}curso{"}"}</code>
              <p className="mt-1 text-gray-600">Nome do curso</p>
            </div>
            <div>
              <code className="rounded bg-gray-100 px-2 py-1">{"{"}carga_horaria{"}"}</code>
              <p className="mt-1 text-gray-600">Carga horária do curso</p>
            </div>
            <div>
              <code className="rounded bg-gray-100 px-2 py-1">{"{"}data{"}"}</code>
              <p className="mt-1 text-gray-600">Data de conclusão</p>
            </div>
            <div>
              <code className="rounded bg-gray-100 px-2 py-1">{"{"}nota{"}"}</code>
              <p className="mt-1 text-gray-600">Nota final do aluno</p>
            </div>
            <div>
              <code className="rounded bg-gray-100 px-2 py-1">{"{"}hash{"}"}</code>
              <p className="mt-1 text-gray-600">ID único do certificado</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
