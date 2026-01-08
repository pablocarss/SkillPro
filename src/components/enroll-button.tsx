"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface EnrollButtonProps {
  courseId: string;
  courseTitle: string;
  price: number | null;
  isEnrolled?: boolean;
  className?: string;
}

export function EnrollButton({
  courseId,
  courseTitle,
  price,
  isEnrolled = false,
  className,
}: EnrollButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const isFree = !price || price === 0;

  const handleEnroll = async () => {
    // Check authentication
    if (status === "unauthenticated") {
      router.push(`/login?redirect=/cursos/${courseId}`);
      return;
    }

    if (status === "loading") {
      return;
    }

    // If already enrolled
    if (isEnrolled) {
      router.push("/dashboard/meus-cursos");
      return;
    }

    setIsLoading(true);

    try {
      if (isFree) {
        // Free course - create enrollment with PENDING status
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
          title: "Inscrição enviada com sucesso!",
          description: "Aguardando aprovação do administrador.",
        });

        // Redirect to dashboard
        router.push("/dashboard/meus-cursos");
      } else {
        // Paid course - redirect to checkout
        router.push(`/checkout/${courseId}`);
      }
    } catch (error) {
      console.error("Erro ao processar inscrição:", error);
      toast({
        title: "Erro ao processar inscrição",
        description: error instanceof Error ? error.message : "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (isLoading) return "";
    if (isEnrolled) return "Ir para Meus Cursos";
    if (isFree) return "Inscrever-se Grátis";
    return "Comprar Agora";
  };

  const getButtonVariant = () => {
    if (isEnrolled) return "outline" as const;
    return "default" as const;
  };

  return (
    <Button
      size="lg"
      variant={getButtonVariant()}
      className={className}
      onClick={handleEnroll}
      disabled={isLoading || status === "loading"}
    >
      {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
      {getButtonText()}
    </Button>
  );
}
