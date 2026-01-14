"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";

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

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  passingScore: number;
  questions: Question[];
  passed?: boolean;
  lastAttempt?: {
    score: number;
    passed: boolean;
  } | null;
}

interface QuizResult {
  score: number;
  passed: boolean;
  correctAnswers: number;
  totalQuestions: number;
  results: { questionId: string; correct: boolean; correctAnswerId: string }[];
}

interface TrainingLessonQuizProps {
  lessonId: string;
  onQuizPassed?: () => void;
}

export function TrainingLessonQuiz({ lessonId, onQuizPassed }: TrainingLessonQuizProps) {
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, Record<string, string>>>({});
  const [results, setResults] = useState<Record<string, QuizResult>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    fetchQuizzes();
  }, [lessonId]);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch(`/api/training-lessons/${lessonId}/quizzes`);
      if (response.ok) {
        const data = await response.json();
        setQuizzes(data);
        // Expand first quiz that hasn't been passed
        const firstUnpassed = data.find((q: Quiz) => !q.passed);
        if (firstUnpassed) {
          setExpandedQuiz(firstUnpassed.id);
        }
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (quizId: string, questionId: string, answerId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [quizId]: {
        ...(prev[quizId] || {}),
        [questionId]: answerId,
      },
    }));
  };

  const handleSubmit = async (quiz: Quiz) => {
    const quizAnswers = answers[quiz.id] || {};

    // Check if all questions are answered
    const unanswered = quiz.questions.filter((q) => !quizAnswers[q.id]);
    if (unanswered.length > 0) {
      toast({
        variant: "destructive",
        title: "Responda todas as questões",
        description: `Ainda faltam ${unanswered.length} questão(ões).`,
      });
      return;
    }

    setSubmitting(quiz.id);
    try {
      const response = await fetch(`/api/training-quizzes/${quiz.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: quizAnswers }),
      });

      const data = await response.json();

      if (response.ok) {
        setResults((prev) => ({
          ...prev,
          [quiz.id]: data,
        }));

        // Update quiz passed status
        setQuizzes((prev) =>
          prev.map((q) =>
            q.id === quiz.id
              ? { ...q, passed: data.passed, lastAttempt: { score: data.score, passed: data.passed } }
              : q
          )
        );

        if (data.passed) {
          toast({
            title: "Parabéns! Você passou no quiz!",
            description: `Sua nota: ${data.score.toFixed(1)}%`,
          });
          onQuizPassed?.();
        } else {
          toast({
            variant: "destructive",
            title: "Você não atingiu a nota mínima",
            description: `Sua nota: ${data.score.toFixed(1)}%. Mínimo: ${quiz.passingScore}%`,
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: data.error || "Erro ao submeter quiz",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao submeter quiz",
      });
    } finally {
      setSubmitting(null);
    }
  };

  const retryQuiz = (quizId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [quizId]: {},
    }));
    setResults((prev) => {
      const newResults = { ...prev };
      delete newResults[quizId];
      return newResults;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (quizzes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h4 className="font-medium flex items-center gap-2">
        <HelpCircle className="h-4 w-4" />
        Quiz da Aula
      </h4>

      {quizzes.map((quiz) => {
        const quizResult = results[quiz.id];
        const quizAnswers = answers[quiz.id] || {};
        const isExpanded = expandedQuiz === quiz.id;
        const answeredCount = Object.keys(quizAnswers).length;

        return (
          <Card key={quiz.id} className={quiz.passed ? "border-green-500" : ""}>
            <CardHeader
              className="cursor-pointer"
              onClick={() => setExpandedQuiz(isExpanded ? null : quiz.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {quiz.passed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <HelpCircle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <CardTitle className="text-sm">{quiz.title}</CardTitle>
                    <CardDescription className="text-xs">
                      {quiz.questions.length} questões • Mínimo: {quiz.passingScore}%
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {quiz.passed && (
                    <Badge className="bg-green-500">Aprovado</Badge>
                  )}
                  {quiz.lastAttempt && !quiz.passed && (
                    <Badge variant="destructive">
                      {quiz.lastAttempt.score.toFixed(0)}%
                    </Badge>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="pt-0">
                {quiz.description && (
                  <p className="text-sm text-muted-foreground mb-4">{quiz.description}</p>
                )}

                {/* Show result if submitted */}
                {quizResult && (
                  <div className={`p-4 rounded-lg mb-4 ${quizResult.passed ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {quizResult.passed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className={`font-medium ${quizResult.passed ? "text-green-600" : "text-red-600"}`}>
                        {quizResult.passed ? "Aprovado!" : "Reprovado"}
                      </span>
                    </div>
                    <p className="text-sm">
                      Você acertou {quizResult.correctAnswers} de {quizResult.totalQuestions} questões
                      ({quizResult.score.toFixed(1)}%)
                    </p>
                    {!quizResult.passed && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => retryQuiz(quiz.id)}
                      >
                        Tentar Novamente
                      </Button>
                    )}
                  </div>
                )}

                {/* Show questions if not passed or no result */}
                {(!quizResult || !quizResult.passed) && !quiz.passed && (
                  <div className="space-y-4">
                    {quiz.questions.map((question, qIndex) => (
                      <div key={question.id} className="space-y-2">
                        <p className="text-sm font-medium">
                          {qIndex + 1}. {question.question}
                        </p>
                        <RadioGroup
                          value={quizAnswers[question.id] || ""}
                          onValueChange={(value) =>
                            handleAnswerChange(quiz.id, question.id, value)
                          }
                        >
                          <div className="space-y-2 pl-4">
                            {question.answers.map((answer) => (
                              <div
                                key={answer.id}
                                className="flex items-center space-x-2"
                              >
                                <RadioGroupItem value={answer.id} id={answer.id} />
                                <Label
                                  htmlFor={answer.id}
                                  className="text-sm font-normal cursor-pointer"
                                >
                                  {answer.answer}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </RadioGroup>
                      </div>
                    ))}

                    <Button
                      className="w-full mt-4"
                      onClick={() => handleSubmit(quiz)}
                      disabled={submitting === quiz.id || answeredCount < quiz.questions.length}
                    >
                      {submitting === quiz.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          Enviar Respostas ({answeredCount}/{quiz.questions.length})
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Show passed message */}
                {quiz.passed && !quizResult && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-600">
                        Você já passou neste quiz!
                      </span>
                    </div>
                    {quiz.lastAttempt && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Nota: {quiz.lastAttempt.score.toFixed(1)}%
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
