"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Trash2, Save, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function TrainingFinalExamPage({ params }: { params: Promise<{ treinamentoId: string }> }) {
  const resolvedParams = use(params);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [hasExam, setHasExam] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: "Prova Final",
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
    fetchExam();
  }, []);

  const fetchExam = async () => {
    try {
      const response = await fetch(`/api/treinamentos/${resolvedParams.treinamentoId}/final-exam`);
      const data = await response.json();

      if (data && data.id) {
        setHasExam(true);
        setFormData({
          title: data.title,
          description: data.description || "",
          passingScore: data.passingScore.toString(),
        });

        if (data.questions && data.questions.length > 0) {
          setQuestions(
            data.questions.map((q: any) => ({
              question: q.question,
              answers: q.answers.map((a: any) => ({
                answer: a.answer,
                isCorrect: a.isCorrect,
              })),
            }))
          );
        }
      }
    } catch (error) {
      // Exam doesn't exist yet
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

  const addAnswer = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex].answers.push({ answer: "", isCorrect: false });
    setQuestions(updated);
  };

  const removeAnswer = (qIndex: number, aIndex: number) => {
    const updated = [...questions];
    if (updated[qIndex].answers.length > 2) {
      // Check if removing the correct answer
      const wasCorrect = updated[qIndex].answers[aIndex].isCorrect;
      updated[qIndex].answers = updated[qIndex].answers.filter((_, i) => i !== aIndex);
      // If we removed the correct answer, mark the first one as correct
      if (wasCorrect && updated[qIndex].answers.length > 0) {
        updated[qIndex].answers[0].isCorrect = true;
      }
      setQuestions(updated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate that all questions have content
    const emptyQuestion = questions.find((q) => !q.question.trim());
    if (emptyQuestion) {
      toast({
        variant: "destructive",
        title: "Preencha todas as perguntas",
      });
      setIsLoading(false);
      return;
    }

    // Validate that all answers have content
    const emptyAnswer = questions.find((q) =>
      q.answers.some((a) => !a.answer.trim())
    );
    if (emptyAnswer) {
      toast({
        variant: "destructive",
        title: "Preencha todas as respostas",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/treinamentos/${resolvedParams.treinamentoId}/final-exam`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          passingScore: parseInt(formData.passingScore),
          questions,
        }),
      });

      if (response.ok) {
        toast({
          title: hasExam ? "Prova final atualizada!" : "Prova final criada!",
        });
        setHasExam(true);
      } else {
        const data = await response.json();
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: error instanceof Error ? error.message : "Erro ao salvar prova final",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/treinamentos/${resolvedParams.treinamentoId}/final-exam`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({ title: "Prova final excluída!" });
        setHasExam(false);
        setFormData({
          title: "Prova Final",
          description: "",
          passingScore: "70",
        });
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
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir prova final",
      });
    }
    setShowDeleteDialog(false);
  };

  return (
    <div>
      <div className="mb-8">
        <Link
          href={`/admin/empresarial/treinamentos/${resolvedParams.treinamentoId}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Treinamento
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold">Configurar Prova Final</h1>
        <p className="text-muted-foreground">Configure a avaliação final do treinamento</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Prova</CardTitle>
            <CardDescription>Configure os detalhes da prova final</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título da Prova</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Instruções ou informações sobre a prova"
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
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Questões ({questions.length})</h2>
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
                  <div className="flex items-center justify-between">
                    <Label>Respostas (marque a correta)</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => addAnswer(qIndex)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>
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
                        className="flex-1"
                        required
                      />
                      {question.answers.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAnswer(qIndex, aIndex)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4">
          {hasExam && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir Prova
            </Button>
          )}
          <div className="flex gap-2 sm:ml-auto">
            <Link href={`/admin/empresarial/treinamentos/${resolvedParams.treinamentoId}`}>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Salvando..." : hasExam ? "Atualizar Prova" : "Criar Prova"}
            </Button>
          </div>
        </div>
      </form>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Prova Final?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todos os dados da prova serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
