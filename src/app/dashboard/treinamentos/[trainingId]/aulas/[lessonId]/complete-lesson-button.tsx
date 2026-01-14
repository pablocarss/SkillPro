"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface CompleteLessonButtonProps {
  lessonId: string;
  trainingId: string;
  isCompleted: boolean;
}

export function CompleteLessonButton({
  lessonId,
  trainingId,
  isCompleted,
}: CompleteLessonButtonProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/training-lessons/${lessonId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark as complete");
      }

      toast({
        title: "Aula concluida!",
        description: "Voce completou esta aula com sucesso.",
      });

      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao marcar aula",
        description: "Tente novamente mais tarde.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCompleted) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <CheckCircle className="h-4 w-4 text-green-600" />
        Concluida
      </Button>
    );
  }

  return (
    <Button onClick={handleComplete} disabled={isLoading} className="gap-2">
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Marcando...
        </>
      ) : (
        <>
          <CheckCircle className="h-4 w-4" />
          Marcar como Concluida
        </>
      )}
    </Button>
  );
}
