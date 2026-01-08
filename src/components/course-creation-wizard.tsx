"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Trash2, ChevronLeft, ChevronRight, Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  videoUrl: string;
  order: number;
  quizzes: Quiz[];
}

interface Quiz {
  id: string;
  title: string;
  passingScore: number;
  questions: Question[];
}

interface Question {
  id: string;
  text: string;
  order: number;
  answers: Answer[];
}

interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface CourseCreationWizardProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CourseCreationWizard({ isOpen, onOpenChange, onSuccess }: CourseCreationWizardProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Basic Info
  const [basicInfo, setBasicInfo] = useState({
    title: "",
    description: "",
    duration: "",
    price: "",
    targetAudience: "",
    level: "Iniciante",
    passingScore: "70",
  });

  // Step 2: Modules
  const [modules, setModules] = useState<Module[]>([]);

  // Step 3: Final Exam
  const [finalExam, setFinalExam] = useState({
    title: "Prova Final",
    passingScore: 70,
    questions: [] as Question[],
  });

  const totalSteps = 3;

  const resetForm = () => {
    setCurrentStep(1);
    setBasicInfo({
      title: "",
      description: "",
      duration: "",
      price: "",
      targetAudience: "",
      level: "Iniciante",
      passingScore: "70",
    });
    setModules([]);
    setFinalExam({
      title: "Prova Final",
      passingScore: 70,
      questions: [],
    });
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addModule = () => {
    const newModule: Module = {
      id: `temp-${Date.now()}`,
      title: "",
      description: "",
      order: modules.length + 1,
      lessons: [],
    };
    setModules([...modules, newModule]);
  };

  const removeModule = (id: string) => {
    setModules(modules.filter(m => m.id !== id));
  };

  const updateModule = (id: string, field: keyof Module, value: string) => {
    setModules(modules.map(m =>
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const addLesson = (moduleId: string) => {
    setModules(modules.map(m => {
      if (m.id === moduleId) {
        const newLesson: Lesson = {
          id: `temp-lesson-${Date.now()}`,
          title: "",
          description: "",
          content: "",
          videoUrl: "",
          order: m.lessons.length + 1,
          quizzes: [],
        };
        return { ...m, lessons: [...m.lessons, newLesson] };
      }
      return m;
    }));
  };

  const removeLesson = (moduleId: string, lessonId: string) => {
    setModules(modules.map(m => {
      if (m.id === moduleId) {
        return { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) };
      }
      return m;
    }));
  };

  const updateLesson = (moduleId: string, lessonId: string, field: keyof Lesson, value: string) => {
    setModules(modules.map(m => {
      if (m.id === moduleId) {
        return {
          ...m,
          lessons: m.lessons.map(l =>
            l.id === lessonId ? { ...l, [field]: value } : l
          ),
        };
      }
      return m;
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      // Create the course with all nested data
      const response = await fetch("/api/courses/create-with-modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...basicInfo,
          price: basicInfo.price ? parseFloat(basicInfo.price) : null,
          passingScore: parseInt(basicInfo.passingScore),
          modules: modules.map((module, moduleIndex) => ({
            title: module.title,
            description: module.description,
            order: moduleIndex + 1,
            lessons: module.lessons.map((lesson, lessonIndex) => ({
              title: lesson.title,
              description: lesson.description,
              content: lesson.content,
              videoUrl: lesson.videoUrl,
              order: lessonIndex + 1,
              quizzes: lesson.quizzes.map(quiz => ({
                title: quiz.title,
                passingScore: quiz.passingScore,
                questions: quiz.questions.map((question, qIndex) => ({
                  text: question.text,
                  order: qIndex + 1,
                  answers: question.answers.map(answer => ({
                    text: answer.text,
                    isCorrect: answer.isCorrect,
                  })),
                })),
              })),
            })),
          })),
          finalExam: finalExam.questions.length > 0 ? {
            title: finalExam.title,
            passingScore: finalExam.passingScore,
            questions: finalExam.questions.map((question, qIndex) => ({
              text: question.text,
              order: qIndex + 1,
              answers: question.answers.map(answer => ({
                text: answer.text,
                isCorrect: answer.isCorrect,
              })),
            })),
          } : null,
        }),
      });

      if (response.ok) {
        toast({
          title: "Curso criado com sucesso!",
          description: "O curso foi criado com todos os módulos e aulas.",
        });
        resetForm();
        onOpenChange(false);
        onSuccess();
      } else {
        throw new Error();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar curso",
        description: "Ocorreu um erro ao criar o curso. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canProceedStep1 = basicInfo.title && basicInfo.description && basicInfo.duration && basicInfo.targetAudience;
  const canProceedStep2 = modules.length > 0 && modules.every(m => m.title && m.lessons.length > 0);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Curso</DialogTitle>
          <DialogDescription>
            Etapa {currentStep} de {totalSteps}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  step < currentStep
                    ? "bg-primary border-primary text-primary-foreground"
                    : step === currentStep
                    ? "border-primary text-primary"
                    : "border-muted text-muted-foreground"
                }`}
              >
                {step < currentStep ? <Check className="h-4 w-4" /> : step}
              </div>
              {step < 3 && (
                <div
                  className={`w-12 h-0.5 ${
                    step < currentStep ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título do Curso *</Label>
              <Input
                id="title"
                value={basicInfo.title}
                onChange={(e) => setBasicInfo({ ...basicInfo, title: e.target.value })}
                placeholder="Ex: Introdução ao Desenvolvimento Web"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                value={basicInfo.description}
                onChange={(e) => setBasicInfo({ ...basicInfo, description: e.target.value })}
                placeholder="Descreva o que os alunos aprenderão neste curso..."
                rows={4}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="duration">Carga Horária *</Label>
                <Input
                  id="duration"
                  value={basicInfo.duration}
                  onChange={(e) => setBasicInfo({ ...basicInfo, duration: e.target.value })}
                  placeholder="Ex: 40 horas"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Valor (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={basicInfo.price}
                  onChange={(e) => setBasicInfo({ ...basicInfo, price: e.target.value })}
                  placeholder="Ex: 199.90"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAudience">Público-Alvo *</Label>
              <Input
                id="targetAudience"
                value={basicInfo.targetAudience}
                onChange={(e) => setBasicInfo({ ...basicInfo, targetAudience: e.target.value })}
                placeholder="Ex: Iniciantes em programação"
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="level">Nível</Label>
                <Select
                  value={basicInfo.level}
                  onValueChange={(value) => setBasicInfo({ ...basicInfo, level: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Iniciante">Iniciante</SelectItem>
                    <SelectItem value="Intermediário">Intermediário</SelectItem>
                    <SelectItem value="Avançado">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="passingScore">Nota de Aprovação (%)</Label>
                <Input
                  id="passingScore"
                  type="number"
                  min="0"
                  max="100"
                  value={basicInfo.passingScore}
                  onChange={(e) => setBasicInfo({ ...basicInfo, passingScore: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Modules and Lessons */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Módulos e Aulas</h3>
              <Button onClick={addModule} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Módulo
              </Button>
            </div>

            {modules.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground text-center">
                    Nenhum módulo adicionado ainda.
                    <br />
                    Clique em "Adicionar Módulo" para começar.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {modules.map((module, moduleIndex) => (
                  <Card key={module.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-4">
                          <div className="space-y-2">
                            <Label>Título do Módulo {moduleIndex + 1} *</Label>
                            <Input
                              value={module.title}
                              onChange={(e) => updateModule(module.id, "title", e.target.value)}
                              placeholder="Ex: Fundamentos Web"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Descrição do Módulo</Label>
                            <Textarea
                              value={module.description}
                              onChange={(e) => updateModule(module.id, "description", e.target.value)}
                              placeholder="Descreva o conteúdo deste módulo..."
                              rows={2}
                            />
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeModule(module.id)}
                          className="ml-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Aulas do Módulo</Label>
                        <Button
                          onClick={() => addLesson(module.id)}
                          size="sm"
                          variant="outline"
                        >
                          <Plus className="mr-2 h-3 w-3" />
                          Adicionar Aula
                        </Button>
                      </div>

                      {module.lessons.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Nenhuma aula adicionada
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {module.lessons.map((lesson, lessonIndex) => (
                            <Card key={lesson.id} className="bg-muted/50">
                              <CardContent className="p-4">
                                <div className="flex items-start gap-2">
                                  <div className="flex-1 space-y-3">
                                    <div className="grid gap-3 md:grid-cols-2">
                                      <div className="space-y-1">
                                        <Label className="text-xs">Título da Aula {lessonIndex + 1} *</Label>
                                        <Input
                                          value={lesson.title}
                                          onChange={(e) => updateLesson(module.id, lesson.id, "title", e.target.value)}
                                          placeholder="Ex: Introdução ao HTML"
                                          size={1}
                                          required
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <Label className="text-xs">URL do Vídeo</Label>
                                        <Input
                                          value={lesson.videoUrl}
                                          onChange={(e) => updateLesson(module.id, lesson.id, "videoUrl", e.target.value)}
                                          placeholder="https://..."
                                          size={1}
                                        />
                                      </div>
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs">Descrição</Label>
                                      <Input
                                        value={lesson.description}
                                        onChange={(e) => updateLesson(module.id, lesson.id, "description", e.target.value)}
                                        placeholder="Breve descrição da aula"
                                        size={1}
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs">Conteúdo</Label>
                                      <Textarea
                                        value={lesson.content}
                                        onChange={(e) => updateLesson(module.id, lesson.id, "content", e.target.value)}
                                        placeholder="Conteúdo teórico da aula..."
                                        rows={3}
                                      />
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeLesson(module.id, lesson.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Final Exam */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Prova Final (Opcional)</h3>
              <p className="text-sm text-muted-foreground">
                A prova final pode ser adicionada depois no gerenciamento do curso.
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground text-center">
                  Você poderá configurar a prova final após criar o curso.
                  <br />
                  Por enquanto, clique em "Criar Curso" para finalizar.
                </p>
              </CardContent>
            </Card>

            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Resumo do Curso</h4>
              <div className="space-y-1 text-sm">
                <p><strong>Título:</strong> {basicInfo.title}</p>
                <p><strong>Duração:</strong> {basicInfo.duration}</p>
                <p><strong>Público-Alvo:</strong> {basicInfo.targetAudience}</p>
                <p><strong>Nível:</strong> {basicInfo.level}</p>
                {basicInfo.price && <p><strong>Valor:</strong> R$ {basicInfo.price}</p>}
                <p><strong>Módulos:</strong> {modules.length}</p>
                <p><strong>Total de Aulas:</strong> {modules.reduce((acc, m) => acc + m.lessons.length, 0)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>

          {currentStep < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !canProceedStep1) ||
                (currentStep === 2 && !canProceedStep2)
              }
            >
              Próximo
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Criando..." : "Criar Curso"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
