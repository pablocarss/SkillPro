"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { Award } from "lucide-react";

interface FinalExam {
  id: string;
  title: string;
  description: string;
  passingScore: number;
  questions: Array<{
    id: string;
    question: string;
    order: number;
    answers: Array<{
      id: string;
      answer: string;
    }>;
  }>;
}

export default function FinalExamPage({ params }: { params: Promise<{ courseId: string }> }) {
  const resolvedParams = use(params);
  const { toast } = useToast();
  const [exam, setExam] = useState<FinalExam | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetchExam();
  }, []);

  const fetchExam = async () => {
    try {
      const response = await fetch(`/api/courses/${resolvedParams.courseId}/final-exam`);
      const data = await response.json();
      setExam(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar prova",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!exam) return;

    if (Object.keys(answers).length !== exam.questions.length) {
      toast({
        variant: "destructive",
        title: "Responda todas as questões",
        description: "Você precisa responder todas as questões antes de enviar.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/final-exams/${exam.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
        toast({
          title: data.passed ? "Parabéns! Você foi aprovado!" : "Não foi dessa vez",
          description: data.passed
            ? `Você foi aprovado com ${data.score.toFixed(1)}%. Seu certificado foi gerado!`
            : `Você obteve ${data.score.toFixed(1)}%. Tente novamente!`,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar respostas",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!exam) {
    return <div>Carregando...</div>;
  }

  if (result) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Resultado da Prova Final</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className={result.passed ? "text-green-600" : "text-red-600"}>
              {result.passed ? "Aprovado!" : "Reprovado"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-2xl font-bold">{result.score.toFixed(1)}%</p>
              <p className="text-gray-600">
                {result.correctAnswers} de {result.totalQuestions} questões corretas
              </p>
            </div>

            {result.passed && result.certificateGenerated && (
              <div className="rounded-lg border-2 border-green-500 bg-green-50 p-4">
                <div className="flex items-center gap-2 text-green-700">
                  <Award className="h-6 w-6" />
                  <div>
                    <p className="font-semibold">Certificado Gerado!</p>
                    <p className="text-sm">Seu certificado está disponível na área de certificados.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Link href={`/dashboard/courses/${resolvedParams.courseId}`}>
                <Button>Voltar para o Curso</Button>
              </Link>
              {result.passed && (
                <Link href="/dashboard/certificates">
                  <Button variant="outline">
                    <Award className="mr-2 h-4 w-4" />
                    Ver Certificado
                  </Button>
                </Link>
              )}
              {!result.passed && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setResult(null);
                    setAnswers({});
                  }}
                >
                  Tentar Novamente
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link
          href={`/dashboard/courses/${resolvedParams.courseId}`}
          className="text-sm text-gray-600 hover:text-primary"
        >
          ← Voltar para o Curso
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">{exam.title}</h1>
        {exam.description && <p className="text-gray-600">{exam.description}</p>}
        <p className="mt-2 text-sm text-gray-600">
          Nota mínima para aprovação: {exam.passingScore}%
        </p>
        <div className="mt-4 rounded-lg bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800">
            <strong>Atenção:</strong> Esta é a prova final do curso. Ao ser aprovado, você receberá
            automaticamente o certificado de conclusão.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {exam.questions.map((question, index) => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="text-lg">Questão {index + 1}</CardTitle>
              <CardDescription>{question.question}</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={answers[question.id]}
                onValueChange={(value) => setAnswers({ ...answers, [question.id]: value })}
              >
                {question.answers.map((answer) => (
                  <div key={answer.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={answer.id} id={answer.id} />
                    <Label htmlFor={answer.id} className="cursor-pointer">
                      {answer.answer}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        ))}

        <div className="flex justify-end gap-4">
          <Link href={`/dashboard/courses/${resolvedParams.courseId}`}>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Enviar Respostas"}
          </Button>
        </div>
      </form>
    </div>
  );
}
