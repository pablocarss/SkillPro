"use client";

import { useState, useEffect, use } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Award,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Answer {
  id: string;
  answer: string;
}

interface Question {
  id: string;
  question: string;
  order: number;
  answers: Answer[];
}

interface Exam {
  id: string;
  title: string;
  description: string | null;
  passingScore: number;
  questions: Question[];
  passed?: boolean;
  lastAttempt?: {
    score: number;
    passed: boolean;
    createdAt: string;
  } | null;
  bestScore?: number | null;
}

interface ExamResult {
  score: number;
  passed: boolean;
  correctAnswers: number;
  totalQuestions: number;
  passingScore: number;
  results: { questionId: string; correct: boolean; correctAnswerId: string }[];
  certificate?: { id: string; certificateHash: string } | null;
}

export default function TrainingExamPage({ params }: { params: Promise<{ treinamentoId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [exam, setExam] = useState<Exam | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ExamResult | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  useEffect(() => {
    fetchExam();
  }, [resolvedParams.treinamentoId]);

  const fetchExam = async () => {
    try {
      const response = await fetch(`/api/treinamentos/${resolvedParams.treinamentoId}/final-exam`);
      if (response.ok) {
        const data = await response.json();
        setExam(data);
      } else {
        const error = await response.json();
        toast({
          variant: "destructive",
          title: error.error || "Prova não encontrada",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar prova",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answerId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }));
  };

  const handleSubmit = async () => {
    if (!exam) return;

    // Check if all questions are answered
    const unanswered = exam.questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      toast({
        variant: "destructive",
        title: "Responda todas as questões",
        description: `Ainda faltam ${unanswered.length} questão(ões) para responder.`,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/training-exams/${exam.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        if (data.passed) {
          toast({
            title: "Parabéns! Você passou!",
            description: `Sua nota: ${data.score.toFixed(1)}%`,
          });
        } else {
          toast({
            variant: "destructive",
            title: "Você não atingiu a nota mínima",
            description: `Sua nota: ${data.score.toFixed(1)}%. Mínimo: ${data.passingScore}%`,
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: data.error || "Erro ao submeter prova",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao submeter prova",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const progress = exam ? (answeredCount / exam.questions.length) * 100 : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Prova não encontrada</h3>
        <p className="text-muted-foreground mb-4">
          Este treinamento não possui prova final ou você não tem acesso.
        </p>
        <Link href={`/treinamentos/${resolvedParams.treinamentoId}`}>
          <Button variant="link">Voltar ao treinamento</Button>
        </Link>
      </div>
    );
  }

  // Show result screen
  if (result) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className={result.passed ? "border-green-500" : "border-red-500"}>
          <CardHeader className="text-center">
            {result.passed ? (
              <>
                <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 mb-4" />
                <CardTitle className="text-2xl text-green-600">Parabéns! Você passou!</CardTitle>
              </>
            ) : (
              <>
                <XCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
                <CardTitle className="text-2xl text-red-600">Você não passou</CardTitle>
              </>
            )}
            <CardDescription>
              {result.passed
                ? "Você completou o treinamento com sucesso!"
                : "Tente novamente para obter a nota mínima."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold">{result.score.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Sua Nota</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold">{result.passingScore}%</p>
                <p className="text-sm text-muted-foreground">Nota Mínima</p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-lg">
                Você acertou{" "}
                <span className="font-bold text-primary">
                  {result.correctAnswers} de {result.totalQuestions}
                </span>{" "}
                questões
              </p>
            </div>

            {result.certificate && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                <Award className="h-8 w-8 mx-auto text-green-600 mb-2" />
                <p className="font-medium text-green-600">Certificado gerado com sucesso!</p>
                <p className="text-sm text-muted-foreground">
                  Hash: {result.certificate.certificateHash}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              {result.passed ? (
                <>
                  <Link href="/treinamentos/certificados" className="flex-1">
                    <Button className="w-full">
                      <Award className="mr-2 h-4 w-4" />
                      Ver Certificados
                    </Button>
                  </Link>
                  <Link href={`/treinamentos/${resolvedParams.treinamentoId}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      Voltar ao Treinamento
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => {
                      setResult(null);
                      setAnswers({});
                      setCurrentQuestion(0);
                    }}
                    className="flex-1"
                  >
                    Tentar Novamente
                  </Button>
                  <Link href={`/treinamentos/${resolvedParams.treinamentoId}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      Revisar Conteúdo
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show previous attempt info
  if (exam.passed && exam.lastAttempt) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-green-500">
          <CardHeader className="text-center">
            <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 mb-4" />
            <CardTitle className="text-2xl text-green-600">Você já passou nesta prova!</CardTitle>
            <CardDescription>
              Sua melhor nota: {exam.bestScore?.toFixed(1) || exam.lastAttempt.score.toFixed(1)}%
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/treinamentos/certificados" className="flex-1">
                <Button className="w-full">
                  <Award className="mr-2 h-4 w-4" />
                  Ver Certificados
                </Button>
              </Link>
              <Link href={`/treinamentos/${resolvedParams.treinamentoId}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao Treinamento
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/treinamentos/${resolvedParams.treinamentoId}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao treinamento
        </Link>

        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{exam.title}</h1>
            {exam.description && (
              <p className="text-muted-foreground mt-1">{exam.description}</p>
            )}
          </div>
          <Badge variant="outline" className="text-sm">
            Mínimo: {exam.passingScore}%
          </Badge>
        </div>
      </div>

      {/* Progress */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Progresso</span>
            <span className="text-sm font-medium">
              {answeredCount} de {exam.questions.length} respondidas
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-6">
        {exam.questions.map((question, index) => (
          <Card key={question.id} className={answers[question.id] ? "border-primary/50" : ""}>
            <CardHeader>
              <CardTitle className="text-base flex items-start gap-3">
                <Badge variant={answers[question.id] ? "default" : "secondary"} className="mt-0.5">
                  {index + 1}
                </Badge>
                <span>{question.question}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={answers[question.id] || ""}
                onValueChange={(value) => handleAnswerChange(question.id, value)}
              >
                <div className="space-y-3">
                  {question.answers.map((answer) => (
                    <div
                      key={answer.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                        answers[question.id] === answer.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/50"
                      }`}
                    >
                      <RadioGroupItem value={answer.id} id={answer.id} />
                      <Label
                        htmlFor={answer.id}
                        className="flex-1 cursor-pointer font-normal"
                      >
                        {answer.answer}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Submit Button */}
      <div className="mt-8 flex justify-end">
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={isSubmitting || answeredCount < exam.questions.length}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Enviar Respostas ({answeredCount}/{exam.questions.length})
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
