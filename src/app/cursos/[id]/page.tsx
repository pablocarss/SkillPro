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

// ISR - Revalidar a cada 30 minutos
export const revalidate = 1800;

// Gerar páginas estáticas para os 20 cursos mais populares
export async function generateStaticParams() {
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    select: { id: true },
    orderBy: { enrollments: { _count: 'desc' } },
    take: 20
  });

  return courses.map((course) => ({
    id: course.id,
  }));
}

// Gerar metadata para SEO
export async function generateMetadata({ params }: { params: { id: string } }) {
  const course = await prisma.course.findUnique({
    where: { id: params.id },
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

export default async function CourseDetailPage({ params }: { params: { id: string } }) {
  // Verificar sessão do usuário
  const session = await getServerSession(authOptions);

  // Buscar curso com todos os detalhes
  const course = await prisma.course.findUnique({
    where: {
      id: params.id,
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
        courseId: params.id,
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
        <section className="relative bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 py-12 sm:py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
              {/* Coluna esquerda - Info do curso */}
              <div className="lg:col-span-2 space-y-6">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Link href="/" className="hover:text-primary">Home</Link>
                  <span>/</span>
                  <Link href="/#cursos" className="hover:text-primary">Cursos</Link>
                  <span>/</span>
                  <span className="text-foreground">{course.title}</span>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {course.level && (
                    <Badge variant={getLevelColor(course.level)}>
                      {course.level}
                    </Badge>
                  )}
                  {course.price && course.price > 0 ? (
                    <Badge className="bg-green-500 text-white">Curso Pago</Badge>
                  ) : (
                    <Badge className="bg-primary">Curso Gratuito</Badge>
                  )}
                </div>

                {/* Título e descrição */}
                <div className="space-y-4">
                  <h1 className="text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                    {course.title}
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    {course.description}
                  </p>
                </div>

                {/* Stats rápidas */}
                <div className="flex flex-wrap gap-6 text-sm">
                  {course.duration && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <span className="font-medium">{course.duration}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <span className="font-medium">{totalLessons} aulas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="font-medium">{course._count.enrollments} alunos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    <span className="font-medium">{course._count.certificates} certificados emitidos</span>
                  </div>
                </div>

                {/* Instrutor */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Instrutor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                          {getInitials(course.createdBy.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{course.createdBy.name}</p>
                        <p className="text-sm text-muted-foreground">{course.createdBy.email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Coluna direita - CTA Card (Sticky) */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24 border-2 border-primary/20">
                  <CardHeader>
                    <div className="aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <PlayCircle className="h-16 w-16 text-primary/40" />
                      )}
                    </div>
                    {course.price && course.price > 0 ? (
                      <div className="text-center space-y-2">
                        <div className="text-4xl font-bold text-primary">
                          R$ {course.price.toFixed(2)}
                        </div>
                        <p className="text-sm text-muted-foreground">Pagamento único</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Badge className="bg-green-500 text-white text-xl py-2 px-6">
                          GRATUITO
                        </Badge>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <EnrollButton
                      courseId={course.id}
                      courseTitle={course.title}
                      price={course.price}
                      isEnrolled={isEnrolled}
                      className="w-full text-lg"
                    />
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Acesso vitalício ao conteúdo</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Certificado de conclusão</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Suporte do instrutor</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
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
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
              <div className="lg:col-span-2 space-y-8">
                {/* O que você vai aprender / Público-alvo */}
                {course.targetAudience && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Para quem é este curso?
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{course.targetAudience}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Currículo do Curso */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Conteúdo do Curso
                    </CardTitle>
                    <CardDescription>
                      {course.modules.length} módulos • {totalLessons} aulas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {course.modules.map((module, index) => (
                        <AccordionItem key={module.id} value={`module-${index}`}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-3 text-left">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary flex-shrink-0">
                                {index + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold">{module.title}</div>
                                {module.description && (
                                  <div className="text-sm text-muted-foreground truncate">
                                    {module.description}
                                  </div>
                                )}
                                <div className="text-xs text-muted-foreground mt-1">
                                  {module.lessons.length} aula{module.lessons.length !== 1 ? 's' : ''}
                                </div>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 pl-11 pt-2">
                              {module.lessons.map((lesson) => (
                                <div
                                  key={lesson.id}
                                  className="flex items-start gap-3 rounded-lg p-3 hover:bg-muted/50 transition-colors"
                                >
                                  <div className="mt-0.5">
                                    {lesson.videoUrl ? (
                                      <PlayCircle className="h-5 w-5 text-primary" />
                                    ) : (
                                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium">{lesson.title}</div>
                                    {lesson.description && (
                                      <div className="text-sm text-muted-foreground line-clamp-2 mt-1">
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
                  <CardHeader>
                    <CardTitle>Requisitos para Certificação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Completar todas as aulas</p>
                          <p className="text-sm text-muted-foreground">
                            Assista todas as {totalLessons} aulas do curso
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Nota mínima: {course.passingScore}%</p>
                          <p className="text-sm text-muted-foreground">
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
