"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Loader2, CreditCard } from "lucide-react";

interface EnrollButtonProps {
  courseId: string;
  courseTitle: string;
  price: number | null;
}

export function EnrollButton({ courseId, courseTitle, price }: EnrollButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const isFree = !price || price === 0;

  const handleEnroll = async () => {
    setIsLoading(true);

    try {
      if (isFree) {
        // Curso gratuito - criar inscrição
        const response = await fetch("/api/enrollments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Erro ao criar inscrição");
        }

        toast({
          title: "Inscrição enviada!",
          description: "Sua inscrição está aguardando aprovação do administrador.",
        });
        router.refresh();
      } else {
        // Curso pago - redirecionar para checkout
        router.push(`/checkout/${courseId}`);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao processar inscrição",
        description: error instanceof Error ? error.message : "Tente novamente mais tarde.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleEnroll} disabled={isLoading} className="w-full">
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processando...
        </>
      ) : isFree ? (
        "Inscrever-se Grátis"
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          Comprar Agora
        </>
      )}
    </Button>
  );
}
