"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { markLessonComplete } from "./actions";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export function CompleteLessonButton({
  lessonId,
  courseId,
  isCompleted,
}: {
  lessonId: string;
  courseId: string;
  isCompleted: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleComplete = async () => {
    setLoading(true);
    try {
      await markLessonComplete(lessonId, courseId);
      toast({
        title: "Aula concluída!",
        description: "Parabéns por completar esta aula.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível marcar a aula como concluída.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isCompleted) {
    return (
      <Button disabled variant="outline" className="gap-2">
        <CheckCircle2 className="h-4 w-4" />
        Aula Concluída
      </Button>
    );
  }

  return (
    <Button onClick={handleComplete} disabled={loading} className="gap-2">
      <CheckCircle2 className="h-4 w-4" />
      {loading ? "Marcando..." : "Marcar como Concluída"}
    </Button>
  );
}
