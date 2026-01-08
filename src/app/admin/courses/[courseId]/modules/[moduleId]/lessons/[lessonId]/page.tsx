"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Trash2 } from "lucide-react";
import Link from "next/link";

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  passingScore: number;
  questions: Array<{
    id: string;
    question: string;
    answers: Array<{
      id: string;
      answer: string;
      isCorrect: boolean;
    }>;
  }>;
}

export default function LessonQuizzesPage({
  params,
}: {
  params: Promise<{ courseId: string; moduleId: string; lessonId: string }>;
}) {
  const resolvedParams = use(params);
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    passingScore: "70",
  });
  const [questions, setQuestions] = useState<
    Array<{
      question: string;
      answers: Array<{ answer: string; isCorrect: boolean }>;
    }>
  >([
    {
      question: "",
      answers: [
        { answer: "", isCorrect: true },
        { answer: "", isCorrect: false },
        { answer: "", isCorrect: false },
        { answer: "", isCorrect: false },
      ],
    },
  ]);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch(`/api/admin/lessons/${resolvedParams.lessonId}/quizzes`);
      const data = await response.json();
      setQuizzes(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar quizzes",
      });
    }
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        answers: [
          { answer: "", isCorrect: true },
          { answer: "", isCorrect: false },
          { answer: "", isCorrect: false },
          { answer: "", isCorrect: false },
        ],
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, value: string) => {
    const updated = [...questions];
    updated[index].question = value;
    setQuestions(updated);
  };

  const updateAnswer = (qIndex: number, aIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].answers[aIndex].answer = value;
    setQuestions(updated);
  };

  const toggleCorrectAnswer = (qIndex: number, aIndex: number) => {
    const updated = [...questions];
    updated[qIndex].answers.forEach((a, i) => {
      a.isCorrect = i === aIndex;
    });
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/lessons/${resolvedParams.lessonId}/quizzes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          questions,
        }),
      });

      if (response.ok) {
        toast({
          title: "Quiz criado com sucesso!",
        });
        setIsOpen(false);
        setFormData({ title: "", description: "", passingScore: "70" });
        setQuestions([
          {
            question: "",
            answers: [
              { answer: "", isCorrect: true },
              { answer: "", isCorrect: false },
              { answer: "", isCorrect: false },
              { answer: "", isCorrect: false },
            ],
          },
        ]);
        fetchQuizzes();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar quiz",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link
            href={`/admin/courses/${resolvedParams.courseId}`}
            className="text-sm text-gray-600 hover:text-primary"
          >
            ← Voltar para Curso
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Gerenciar Quizzes da Aula</h1>
          <p className="text-gray-600">Crie quizzes para testar o conhecimento dos alunos</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Quiz
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Quiz</DialogTitle>
              <DialogDescription>Configure o quiz e suas questões</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título do Quiz</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passingScore">Nota Mínima de Aprovação (%)</Label>
                  <Input
                    id="passingScore"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.passingScore}
                    onChange={(e) => setFormData({ ...formData, passingScore: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Questões</h3>
                  <Button type="button" variant="outline" onClick={addQuestion}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Questão
                  </Button>
                </div>

                {questions.map((question, qIndex) => (
                  <Card key={qIndex}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Questão {qIndex + 1}</CardTitle>
                        {questions.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQuestion(qIndex)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Pergunta</Label>
                        <Input
                          value={question.question}
                          onChange={(e) => updateQuestion(qIndex, e.target.value)}
                          placeholder="Digite a pergunta"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Respostas (marque a correta)</Label>
                        {question.answers.map((answer, aIndex) => (
                          <div key={aIndex} className="flex items-center gap-2">
                            <Checkbox
                              checked={answer.isCorrect}
                              onCheckedChange={() => toggleCorrectAnswer(qIndex, aIndex)}
                            />
                            <Input
                              value={answer.answer}
                              onChange={(e) => updateAnswer(qIndex, aIndex, e.target.value)}
                              placeholder={`Resposta ${aIndex + 1}`}
                              required
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Criando..." : "Criar Quiz"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {quizzes.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              Nenhum quiz criado ainda. Clique em "Novo Quiz" para começar.
            </CardContent>
          </Card>
        ) : (
          quizzes.map((quiz) => (
            <Card key={quiz.id}>
              <CardHeader>
                <CardTitle>{quiz.title}</CardTitle>
                {quiz.description && <CardDescription>{quiz.description}</CardDescription>}
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Questões:</strong> {quiz.questions.length}
                  </p>
                  <p>
                    <strong>Nota mínima:</strong> {quiz.passingScore}%
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
