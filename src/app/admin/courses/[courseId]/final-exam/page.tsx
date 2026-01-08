"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Trash2, Save } from "lucide-react";
import Link from "next/link";

export default function FinalExamPage({ params }: { params: Promise<{ courseId: string }> }) {
  const resolvedParams = use(params);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [hasExam, setHasExam] = useState(false);
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
    fetchExam();
  }, []);

  const fetchExam = async () => {
    try {
      const response = await fetch(`/api/courses/${resolvedParams.courseId}/final-exam`);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/courses/${resolvedParams.courseId}/final-exam`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          questions,
        }),
      });

      if (response.ok) {
        toast({
          title: hasExam ? "Prova final atualizada!" : "Prova final criada!",
        });
        setHasExam(true);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar prova final",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <Link
          href={`/admin/courses/${resolvedParams.courseId}`}
          className="text-sm text-gray-600 hover:text-primary"
        >
          ← Voltar para Curso
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Configurar Prova Final</h1>
        <p className="text-gray-600">Configure a avaliação final do curso</p>
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
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Questões</h2>
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
          <Link href={`/admin/courses/${resolvedParams.courseId}`}>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Salvando..." : hasExam ? "Atualizar Prova" : "Criar Prova"}
          </Button>
        </div>
      </form>
    </div>
  );
}
