"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Award, Loader2 } from "lucide-react";

interface GenerateCertificateButtonProps {
  courseId: string;
  studentId: string;
  hasPassed: boolean;
  hasCertificate: boolean;
}

export function GenerateCertificateButton({
  courseId,
  studentId,
  hasPassed,
  hasCertificate,
}: GenerateCertificateButtonProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null);

  const handleGenerateCertificate = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch("/api/certificates/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          studentId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCertificateUrl(data.pdfUrl);
        toast({
          title: "Certificado gerado com sucesso!",
          description: "Seu certificado esta pronto para download.",
        });
        // Reload page to update the certificate status
        window.location.reload();
      } else {
        const error = await response.json();
        toast({
          variant: "destructive",
          title: "Erro ao gerar certificado",
          description: error.error || "Tente novamente mais tarde.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao gerar certificado",
        description: "Ocorreu um erro. Tente novamente mais tarde.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (hasCertificate) {
    return null;
  }

  if (!hasPassed) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center gap-3">
          <Award className="h-6 w-6 text-gray-400" />
          <div>
            <p className="font-medium text-gray-600">Certificado indisponivel</p>
            <p className="text-sm text-gray-500">
              Voce precisa ser aprovado na prova final para obter o certificado.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Award className="h-6 w-6 text-green-600" />
          <div>
            <p className="font-medium text-green-900">Parabens! Voce foi aprovado!</p>
            <p className="text-sm text-green-700">
              Clique no botao ao lado para gerar seu certificado.
            </p>
          </div>
        </div>
        <Button
          onClick={handleGenerateCertificate}
          disabled={isGenerating}
          className="bg-green-600 hover:bg-green-700"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <Award className="mr-2 h-4 w-4" />
              Gerar Certificado
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
