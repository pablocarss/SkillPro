"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload,
  X,
  FileText,
  File,
  FileSpreadsheet,
  Presentation,
  Archive,
  Link as LinkIcon,
  Loader2,
  Trash2,
} from "lucide-react";

interface Material {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileType: string;
  fileSize: number | null;
  isExternal: boolean;
}

interface TrainingMaterialUploadProps {
  lessonId: string;
  materials: Material[];
  onMaterialAdded: () => void;
  onMaterialDeleted: () => void;
}

const FILE_ICONS: Record<string, React.ReactNode> = {
  pdf: <FileText className="h-5 w-5 text-red-500" />,
  doc: <FileText className="h-5 w-5 text-blue-500" />,
  docx: <FileText className="h-5 w-5 text-blue-500" />,
  xls: <FileSpreadsheet className="h-5 w-5 text-green-500" />,
  xlsx: <FileSpreadsheet className="h-5 w-5 text-green-500" />,
  ppt: <Presentation className="h-5 w-5 text-orange-500" />,
  pptx: <Presentation className="h-5 w-5 text-orange-500" />,
  zip: <Archive className="h-5 w-5 text-yellow-500" />,
  rar: <Archive className="h-5 w-5 text-yellow-500" />,
  "7z": <Archive className="h-5 w-5 text-yellow-500" />,
  epub: <FileText className="h-5 w-5 text-purple-500" />,
};

function getFileIcon(fileType: string) {
  return FILE_ICONS[fileType.toLowerCase()] || <File className="h-5 w-5 text-gray-500" />;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function TrainingMaterialUpload({
  lessonId,
  materials,
  onMaterialAdded,
  onMaterialDeleted,
}: TrainingMaterialUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadFormData, setUploadFormData] = useState({
    title: "",
    description: "",
  });

  const [urlFormData, setUrlFormData] = useState({
    title: "",
    description: "",
    fileUrl: "",
    fileType: "pdf",
  });
  const [isAddingUrl, setIsAddingUrl] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Arquivo muito grande",
        description: "O tamanho maximo e 100MB.",
      });
      return;
    }

    setSelectedFile(file);
    // Preencher o título com o nome do arquivo se estiver vazio
    if (!uploadFormData.title) {
      const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extensão
      setUploadFormData({ ...uploadFormData, title: fileName });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadFormData.title) {
      toast({
        variant: "destructive",
        title: "Preencha todos os campos",
        description: "Selecione um arquivo e informe o titulo.",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 1. Upload do arquivo
      const formData = new FormData();
      formData.append("file", selectedFile);

      const xhr = new XMLHttpRequest();

      const uploadPromise = new Promise<any>((resolve, reject) => {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(percentComplete);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error("Upload failed"));
          }
        });

        xhr.addEventListener("error", () => reject(new Error("Upload failed")));
        xhr.open("POST", "/api/upload/material");
        xhr.send(formData);
      });

      const uploadResult = await uploadPromise;

      // 2. Criar registro do material - usa API de treinamentos
      const response = await fetch(`/api/training-lessons/${lessonId}/materials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: uploadFormData.title,
          description: uploadFormData.description,
          fileUrl: uploadResult.url,
          fileType: uploadResult.fileType,
          fileSize: uploadResult.fileSize,
          isExternal: false,
        }),
      });

      if (!response.ok) throw new Error("Failed to create material");

      toast({
        title: "Material adicionado!",
        description: "O arquivo foi enviado com sucesso.",
      });

      // Limpar formulário
      setSelectedFile(null);
      setUploadFormData({ title: "", description: "" });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      onMaterialAdded();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar arquivo",
        description: "Tente novamente mais tarde.",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleAddUrl = async () => {
    if (!urlFormData.title || !urlFormData.fileUrl) {
      toast({
        variant: "destructive",
        title: "Preencha todos os campos",
        description: "Informe o titulo e a URL do arquivo.",
      });
      return;
    }

    setIsAddingUrl(true);

    try {
      const response = await fetch(`/api/training-lessons/${lessonId}/materials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: urlFormData.title,
          description: urlFormData.description,
          fileUrl: urlFormData.fileUrl,
          fileType: urlFormData.fileType,
          fileSize: null,
          isExternal: true,
        }),
      });

      if (!response.ok) throw new Error("Failed to create material");

      toast({
        title: "Material adicionado!",
        description: "O link foi adicionado com sucesso.",
      });

      // Limpar formulário
      setUrlFormData({ title: "", description: "", fileUrl: "", fileType: "pdf" });

      onMaterialAdded();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao adicionar link",
        description: "Tente novamente mais tarde.",
      });
    } finally {
      setIsAddingUrl(false);
    }
  };

  const handleDelete = async (materialId: string) => {
    if (!confirm("Tem certeza que deseja remover este material?")) return;

    setDeletingId(materialId);

    try {
      const response = await fetch(
        `/api/training-lessons/${lessonId}/materials/${materialId}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Failed to delete");

      toast({
        title: "Material removido",
        description: "O material foi removido com sucesso.",
      });

      onMaterialDeleted();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao remover material",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Lista de Materiais Existentes */}
      {materials.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Materiais Cadastrados</h4>
          <div className="space-y-2">
            {materials.map((material) => (
              <div
                key={material.id}
                className="flex items-center justify-between rounded-lg border bg-gray-50 p-3"
              >
                <div className="flex items-center gap-3">
                  {getFileIcon(material.fileType)}
                  <div>
                    <p className="font-medium text-gray-900">{material.title}</p>
                    <p className="text-xs text-gray-500">
                      {material.fileType.toUpperCase()}
                      {material.fileSize && ` - ${formatFileSize(material.fileSize)}`}
                      {material.isExternal && " (Link externo)"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={material.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Abrir
                  </a>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(material.id)}
                    disabled={deletingId === material.id}
                  >
                    {deletingId === material.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-red-500" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formulário de Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Adicionar Material de Apoio</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upload">
            <TabsList className="mb-4">
              <TabsTrigger value="upload">
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="url">
                <LinkIcon className="mr-2 h-4 w-4" />
                Por URL
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
              <div className="space-y-2">
                <Label>Arquivo</Label>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.7z,.txt,.csv,.epub"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                />
                <p className="text-xs text-gray-500">
                  PDF, Word, Excel, PowerPoint, ZIP, EPUB (max. 100MB)
                </p>
                {selectedFile && (
                  <div className="flex items-center gap-2 rounded bg-gray-100 p-2 text-sm">
                    {getFileIcon(selectedFile.name.split(".").pop() || "")}
                    <span>{selectedFile.name}</span>
                    <span className="text-gray-500">
                      ({formatFileSize(selectedFile.size)})
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="ml-auto h-6 w-6"
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="upload-title">Titulo *</Label>
                <Input
                  id="upload-title"
                  value={uploadFormData.title}
                  onChange={(e) =>
                    setUploadFormData({ ...uploadFormData, title: e.target.value })
                  }
                  placeholder="Ex: Apostila do Modulo 1"
                  disabled={isUploading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="upload-desc">Descricao (opcional)</Label>
                <Textarea
                  id="upload-desc"
                  value={uploadFormData.description}
                  onChange={(e) =>
                    setUploadFormData({ ...uploadFormData, description: e.target.value })
                  }
                  placeholder="Breve descricao do material..."
                  rows={2}
                  disabled={isUploading}
                />
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Enviando...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <Button
                type="button"
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Enviar Arquivo
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="url" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url-title">Titulo *</Label>
                <Input
                  id="url-title"
                  value={urlFormData.title}
                  onChange={(e) =>
                    setUrlFormData({ ...urlFormData, title: e.target.value })
                  }
                  placeholder="Ex: E-book de JavaScript"
                  disabled={isAddingUrl}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="url-link">URL do Arquivo *</Label>
                <Input
                  id="url-link"
                  type="url"
                  value={urlFormData.fileUrl}
                  onChange={(e) =>
                    setUrlFormData({ ...urlFormData, fileUrl: e.target.value })
                  }
                  placeholder="https://exemplo.com/arquivo.pdf"
                  disabled={isAddingUrl}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="url-type">Tipo do Arquivo</Label>
                <select
                  id="url-type"
                  value={urlFormData.fileType}
                  onChange={(e) =>
                    setUrlFormData({ ...urlFormData, fileType: e.target.value })
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  disabled={isAddingUrl}
                >
                  <option value="pdf">PDF</option>
                  <option value="doc">Word (DOC)</option>
                  <option value="docx">Word (DOCX)</option>
                  <option value="xls">Excel (XLS)</option>
                  <option value="xlsx">Excel (XLSX)</option>
                  <option value="ppt">PowerPoint (PPT)</option>
                  <option value="pptx">PowerPoint (PPTX)</option>
                  <option value="zip">ZIP</option>
                  <option value="epub">E-book (EPUB)</option>
                  <option value="other">Outro</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="url-desc">Descricao (opcional)</Label>
                <Textarea
                  id="url-desc"
                  value={urlFormData.description}
                  onChange={(e) =>
                    setUrlFormData({ ...urlFormData, description: e.target.value })
                  }
                  placeholder="Breve descricao do material..."
                  rows={2}
                  disabled={isAddingUrl}
                />
              </div>

              <Button
                type="button"
                onClick={handleAddUrl}
                disabled={isAddingUrl}
                className="w-full"
              >
                {isAddingUrl ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  <>
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Adicionar Link
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
