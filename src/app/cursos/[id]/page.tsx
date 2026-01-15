import { Navbar } from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EnrollButton } from "@/components/enroll-button";
import { Clock, BookOpen, Users, Award, Target, PlayCircle, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

// Forçar renderização dinâmica (SSR)
export const dynamic = 'force-dynamic';

// Gerar metadata para SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = await prisma.course.findUnique({
    where: { id },
    select: { title: true, description: true, thumbnail: true }
  });

  if (!course) {
    return {
      title: "Curso não encontrado - SkillPro",
    };
  }

  return {
    title: `${course.title} - SkillPro`,
    description: course.description,
    openGraph: {
      title: course.title,
      description: course.description,
      images: course.thumbnail ? [course.thumbnail] : [],
      type: "website",
    },
  };
}

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Verificar sessão do usuário
  const session = await getServerSession(authOptions);

  // Buscar curso com todos os detalhes
  const course = await prisma.course.findUnique({
    where: {
      id,
      isPublished: true,
    },
    include: {
      createdBy: {
        select: { name: true, email: true }
      },
      modules: {
        include: {
          lessons: {
            select: { id: true, title: true, order: true, videoUrl: true, description: true },
            orderBy: { order: 'asc' }
          }
        },
        orderBy: { order: 'asc' }
      },
      _count: {
        select: { enrollments: true, certificates: true }
      }
    }
  });

  if (!course) {
    notFound();
  }

  // Verificar se o usuário está inscrito no curso
  let isEnrolled = false;
  if (session?.user?.id) {
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        courseId: id,
        studentId: session.user.id,
      }
    });
    isEnrolled = !!enrollment;
  }

  // Calcular total de aulas
  const totalLessons = course.modules.reduce(
    (total, module) => total + module.lessons.length,
    0
  );

  // Função para gerar iniciais do nome
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Função para determinar cor do badge de nível
  const getLevelColor = (level?: string | null) => {
    if (!level) return "secondary";
    const levelLower = level.toLowerCase();
    if (levelLower.includes("iniciante")) return "default";
    if (levelLower.includes("intermediário") || levelLower.includes("intermediario")) return "secondary";
    if (levelLower.includes("avançado") || levelLower.includes("avancado")) return "destructive";
    return "secondary";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 py-8 sm:py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-8 xl:gap-12">
              {/* Coluna esquerda - Info do curso */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
                  <Link href="/" className="hover:text-primary">Home</Link>
                  <span>/</span>
                  <Link href="/#cursos" className="hover:text-primary">Cursos</Link>
                  <span>/</span>
                  <span className="text-foreground truncate max-w-[150px] sm:max-w-none">{course.title}</span>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {course.level && (
                    <Badge variant={getLevelColor(course.level)} className="text-xs sm:text-sm">
                      {course.level}
                    </Badge>
                  )}
                  {course.price && course.price > 0 ? (
                    <Badge className="bg-green-500 text-white text-xs sm:text-sm">Curso Pago</Badge>
                  ) : (
                    <Badge className="bg-primary text-xs sm:text-sm">Curso Gratuito</Badge>
                  )}
                </div>

                {/* Título e descrição */}
                <div className="space-y-3 sm:space-y-4">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground">
                    {course.title}
                  </h1>
                  <p className="text-base sm:text-lg text-muted-foreground">
                    {course.description}
                  </p>
                </div>

                {/* Stats rápidas */}
                <div className="flex flex-wrap gap-3 sm:gap-4 lg:gap-6 text-xs sm:text-sm">
                  {course.duration && (
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                      <span className="font-medium">{course.duration}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                    <span className="font-medium">{totalLessons} aulas</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                    <span className="font-medium">{course._count.enrollments} alunos</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Award className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                    <span className="font-medium">{course._count.certificates} certificados</span>
                  </div>
                </div>

                {/* Instrutor */}
                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-base sm:text-lg">Instrutor</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-base sm:text-lg">
                          {getInitials(course.createdBy.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm sm:text-base truncate">{course.createdBy.name}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{course.createdBy.email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Coluna direita - CTA Card (Sticky) */}
              <div className="lg:col-span-1">
                <Card className="lg:sticky lg:top-24 border-2 border-primary/20">
                  <CardHeader className="p-4 sm:p-6">
                    <div className="aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center mb-3 sm:mb-4">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <PlayCircle className="h-12 w-12 sm:h-16 sm:w-16 text-primary/40" />
                      )}
                    </div>
                    {course.price && course.price > 0 ? (
                      <div className="text-center space-y-1 sm:space-y-2">
                        <div className="text-3xl sm:text-4xl font-bold text-primary">
                          R$ {course.price.toFixed(2)}
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground">Pagamento único</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Badge className="bg-green-500 text-white text-lg sm:text-xl py-1.5 sm:py-2 px-4 sm:px-6">
                          GRATUITO
                        </Badge>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                    <EnrollButton
                      courseId={course.id}
                      courseTitle={course.title}
                      price={course.price}
                      isEnrolled={isEnrolled}
                      className="w-full text-base sm:text-lg h-11 sm:h-12"
                    />
                    <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Acesso vitalício ao conteúdo</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Certificado de conclusão</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Suporte do instrutor</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Estude no seu ritmo</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Informações Adicionais */}
        <section className="py-8 sm:py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-8 xl:gap-12">
              <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                {/* O que você vai aprender / Público-alvo */}
                {course.targetAudience && (
                  <Card>
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Target className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                        Para quem é este curso?
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0">
                      <p className="text-sm sm:text-base text-muted-foreground">{course.targetAudience}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Currículo do Curso */}
                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                      Conteúdo do Curso
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      {course.modules.length} módulos • {totalLessons} aulas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <Accordion type="single" collapsible className="w-full">
                      {course.modules.map((module, index) => (
                        <AccordionItem key={module.id} value={`module-${index}`}>
                          <AccordionTrigger className="hover:no-underline py-3 sm:py-4">
                            <div className="flex items-center gap-2 sm:gap-3 text-left">
                              <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-primary/10 text-xs sm:text-sm font-semibold text-primary flex-shrink-0">
                                {index + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm sm:text-base">{module.title}</div>
                                {module.description && (
                                  <div className="text-xs sm:text-sm text-muted-foreground truncate">
                                    {module.description}
                                  </div>
                                )}
                                <div className="text-xs text-muted-foreground mt-0.5 sm:mt-1">
                                  {module.lessons.length} aula{module.lessons.length !== 1 ? 's' : ''}
                                </div>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-1.5 sm:space-y-2 pl-8 sm:pl-11 pt-1 sm:pt-2">
                              {module.lessons.map((lesson) => (
                                <div
                                  key={lesson.id}
                                  className="flex items-start gap-2 sm:gap-3 rounded-lg p-2 sm:p-3 hover:bg-muted/50 transition-colors"
                                >
                                  <div className="mt-0.5 flex-shrink-0">
                                    {lesson.videoUrl ? (
                                      <PlayCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                    ) : (
                                      <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm sm:text-base">{lesson.title}</div>
                                    {lesson.description && (
                                      <div className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-0.5 sm:mt-1">
                                        {lesson.description}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>

                {/* Requisitos / Nota de Aprovação */}
                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-base sm:text-lg">Requisitos para Certificação</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm sm:text-base">Completar todas as aulas</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Assista todas as {totalLessons} aulas do curso
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm sm:text-base">Nota mínima: {course.passingScore}%</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Alcance pelo menos {course.passingScore}% na avaliação final
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 SkillPro. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
