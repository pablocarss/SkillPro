"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Award, Download, Building2, Calendar, ExternalLink } from "lucide-react";

interface Certificate {
  id: string;
  certificateHash: string;
  issueDate: string;
  finalScore: number;
  pdfUrl: string | null;
  training: {
    id: string;
    title: string;
    company: {
      name: string;
    } | null;
  };
}

export default function TreinamentosCertificadosPage() {
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await fetch("/api/treinamentos/certificados");
      if (response.ok) {
        const data = await response.json();
        setCertificates(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar certificados",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCertificate = async (trainingId: string) => {
    try {
      const response = await fetch("/api/treinamentos/certificados/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainingId }),
      });

      if (response.ok) {
        toast({ title: "Certificado gerado com sucesso!" });
        fetchCertificates();
      } else {
        const data = await response.json();
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: error instanceof Error ? error.message : "Erro ao gerar certificado",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Meus Certificados</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Certificados dos treinamentos concluídos
        </p>
      </div>

      {certificates.length === 0 ? (
        <div className="text-center py-12">
          <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Nenhum certificado encontrado</h3>
          <p className="text-muted-foreground">
            Complete seus treinamentos e passe na prova final para obter certificados.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((certificate) => (
            <Card key={certificate.id} className="hover:shadow-lg transition-shadow border-primary/20">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-5 w-5 text-primary" />
                      <Badge className="bg-green-500 hover:bg-green-600">Concluído</Badge>
                    </div>
                    <CardTitle className="text-base sm:text-lg line-clamp-2">
                      {certificate.training.title}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
                <div className="space-y-2 text-xs sm:text-sm">
                  {certificate.training.company && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5" />
                      <span>{certificate.training.company.name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      Emitido em {new Date(certificate.issueDate).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nota Final:</span>
                    <span className="font-medium text-green-600">
                      {certificate.finalScore.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-2">
                    Código de verificação:
                  </p>
                  <code className="text-xs bg-muted px-2 py-1 rounded block truncate">
                    {certificate.certificateHash}
                  </code>
                </div>

                <div className="flex gap-2">
                  {certificate.pdfUrl ? (
                    <a href={certificate.pdfUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Baixar PDF
                      </Button>
                    </a>
                  ) : (
                    <Button
                      className="flex-1"
                      onClick={() => handleGenerateCertificate(certificate.training.id)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Gerar PDF
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
