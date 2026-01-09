"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Company {
  id: string;
  name: string;
}

interface ImportResult {
  success: boolean;
  email: string;
  name: string;
  error?: string;
}

interface ImportResponse {
  message: string;
  summary: {
    total: number;
    created: number;
    duplicates: number;
    errors: number;
  };
  results: ImportResult[];
  validationErrors?: { row: number; error: string }[];
}

interface EmployeeImportDialogProps {
  companies: Company[];
  onSuccess: () => void;
}

export function EmployeeImportDialog({ companies, onSuccess }: EmployeeImportDialogProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState("123456");
  const [importResult, setImportResult] = useState<ImportResponse | null>(null);

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch("/api/admin/funcionarios/template");
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "modelo_funcionarios.xlsx";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error("Erro ao baixar modelo");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao baixar modelo",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
        toast({
          variant: "destructive",
          title: "Arquivo inválido",
          description: "Por favor, selecione um arquivo Excel (.xlsx ou .xls)",
        });
        return;
      }
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedCompany || !selectedFile) {
      toast({
        variant: "destructive",
        title: "Preencha todos os campos",
        description: "Selecione uma empresa e um arquivo para importar",
      });
      return;
    }

    setIsLoading(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("companyId", selectedCompany);
      formData.append("password", password);

      const response = await fetch("/api/admin/funcionarios/import", {
        method: "POST",
        body: formData,
      });

      const data: ImportResponse = await response.json();

      if (response.ok) {
        setImportResult(data);
        if (data.summary.created > 0) {
          toast({
            title: "Importacao concluida!",
            description: data.message,
          });
          onSuccess();
        }
      } else {
        throw new Error(data.message || "Erro ao importar funcionários");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro na importacao",
        description: error instanceof Error ? error.message : "Erro ao importar funcionários",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedFile(null);
    setSelectedCompany("");
    setImportResult(null);
    setPassword("123456");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (open ? setIsOpen(true) : handleClose())}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Importar Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar Funcionarios via Excel</DialogTitle>
          <DialogDescription>
            Faca upload de uma planilha Excel com os dados dos funcionarios a serem cadastrados.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Download Template */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-medium">Modelo de Planilha</p>
                <p className="text-sm text-muted-foreground">
                  Baixe o modelo com as colunas corretas
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleDownloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Baixar Modelo
            </Button>
          </div>

          {/* Company Selection */}
          <div className="space-y-2">
            <Label htmlFor="company">Empresa de Destino *</Label>
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
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

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">Arquivo Excel *</Label>
            <Input
              id="file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Arquivo selecionado: {selectedFile.name}
              </p>
            )}
          </div>

          {/* Default Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Senha Padrao</Label>
            <Input
              id="password"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha padrão para os funcionários"
            />
            <p className="text-xs text-muted-foreground">
              Esta senha sera usada para todos os funcionarios importados. Eles poderao alterar depois.
            </p>
          </div>

          {/* Expected Columns Info */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium mb-1">Colunas esperadas na planilha:</p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary">Nome *</Badge>
                <Badge variant="secondary">Email *</Badge>
                <Badge variant="outline">CPF</Badge>
                <Badge variant="outline">Telefone</Badge>
                <Badge variant="outline">Cargo</Badge>
              </div>
              <p className="text-xs mt-1">* Campos obrigatorios</p>
            </AlertDescription>
          </Alert>

          {/* Import Results */}
          {importResult && (
            <div className="space-y-3">
              <Alert variant={importResult.summary.errors > 0 ? "destructive" : "default"}>
                {importResult.summary.errors > 0 ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                <AlertDescription>
                  <p className="font-medium">{importResult.message}</p>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span className="text-green-600">
                      Criados: {importResult.summary.created}
                    </span>
                    <span className="text-yellow-600">
                      Duplicados: {importResult.summary.duplicates}
                    </span>
                    <span className="text-red-600">
                      Erros: {importResult.summary.errors}
                    </span>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Validation Errors */}
              {importResult.validationErrors && importResult.validationErrors.length > 0 && (
                <div className="border rounded-lg p-3 max-h-40 overflow-y-auto">
                  <p className="font-medium text-sm mb-2">Erros de validacao:</p>
                  <div className="space-y-1">
                    {importResult.validationErrors.map((err, idx) => (
                      <p key={idx} className="text-sm text-destructive">
                        Linha {err.row}: {err.error}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Import Results Details */}
              {importResult.results.filter((r) => !r.success).length > 0 && (
                <div className="border rounded-lg p-3 max-h-40 overflow-y-auto">
                  <p className="font-medium text-sm mb-2">Funcionarios nao importados:</p>
                  <div className="space-y-1">
                    {importResult.results
                      .filter((r) => !r.success)
                      .map((r, idx) => (
                        <p key={idx} className="text-sm">
                          <span className="font-medium">{r.name}</span> ({r.email}):{" "}
                          <span className="text-destructive">{r.error}</span>
                        </p>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              {importResult ? "Fechar" : "Cancelar"}
            </Button>
            {!importResult && (
              <Button
                onClick={handleImport}
                disabled={!selectedCompany || !selectedFile || isLoading}
              >
                {isLoading ? "Importando..." : "Importar Funcionarios"}
              </Button>
            )}
            {importResult && importResult.summary.created > 0 && (
              <Button onClick={handleClose}>
                Concluir
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
