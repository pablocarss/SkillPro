"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Quiz {
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

export default function QuizPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string; quizId: string }>;
}) {
  const resolvedParams = use(params);
  const { toast } = useToast();
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetchQuiz();
  }, []);

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`/api/lessons/${resolvedParams.lessonId}/quizzes`);
      const data = await response.json();
      const foundQuiz = data.find((q: Quiz) => q.id === resolvedParams.quizId);
      setQuiz(foundQuiz);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar quiz",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!quiz) return;

    if (Object.keys(answers).length !== quiz.questions.length) {
      toast({
        variant: "destructive",
        title: "Responda todas as questões",
        description: "Você precisa responder todas as questões antes de enviar.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/quizzes/${resolvedParams.quizId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
        toast({
          title: data.passed ? "Parabéns!" : "Não foi dessa vez",
          description: data.passed
            ? `Você foi aprovado com ${data.score.toFixed(1)}%`
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

  if (!quiz) {
    return <div>Carregando...</div>;
  }

  if (result) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Resultado do Quiz</h1>
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

            <div className="flex gap-4">
              <Link href={`/dashboard/courses/${resolvedParams.courseId}`}>
                <Button>Voltar para o Curso</Button>
              </Link>
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
          href={`/dashboard/courses/${resolvedParams.courseId}/lessons/${resolvedParams.lessonId}`}
          className="text-sm text-gray-600 hover:text-primary"
        >
          ← Voltar para a Aula
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">{quiz.title}</h1>
        {quiz.description && <p className="text-gray-600">{quiz.description}</p>}
        <p className="mt-2 text-sm text-gray-600">
          Nota mínima para aprovação: {quiz.passingScore}%
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {quiz.questions.map((question, index) => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="text-lg">
                Questão {index + 1}
              </CardTitle>
              <CardDescription>{question.question}</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={answers[question.id]}
                onValueChange={(value) =>
                  setAnswers({ ...answers, [question.id]: value })
                }
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
          <Link href={`/dashboard/courses/${resolvedParams.courseId}/lessons/${resolvedParams.lessonId}`}>
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
