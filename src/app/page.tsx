import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { StatsSection } from "@/components/landing/stats-section";
import { FeaturedCourses } from "@/components/landing/featured-courses";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { CourseCard } from "@/components/course-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Award, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

// ISR - Revalidar a cada 1 hora
export const revalidate = 3600;

export default async function Home() {
  // Buscar estatísticas
  const [approvedEnrollments, publishedCourses, certificates, students] = await Promise.all([
    prisma.enrollment.count({ where: { status: 'APPROVED' } }),
    prisma.course.count({ where: { isPublished: true } }),
    prisma.certificate.count(),
    prisma.user.count({ where: { role: 'STUDENT' } })
  ]);

  // Buscar 6 cursos em destaque (mais populares)
  const featuredCourses = await prisma.course.findMany({
    where: { isPublished: true },
    include: {
      _count: { select: { enrollments: true } },
      modules: {
        include: {
          lessons: { select: { id: true } }
        }
      }
    },
    orderBy: { enrollments: { _count: 'desc' } },
    take: 6
  });

  // Buscar depoimentos aprovados
  const testimonials = await prisma.testimonial.findMany({
    where: { isApproved: true },
    include: {
      student: { select: { name: true } },
      course: { select: { title: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 6
  });

  const stats = {
    students,
    courses: publishedCourses,
    certificates
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        {/* Hero Section */}
        <HeroSection />

        {/* Stats Section */}
        <StatsSection stats={stats} />

        {/* Featured Courses */}
        {featuredCourses.length > 0 && (
          <FeaturedCourses courses={featuredCourses} />
        )}

        {/* Why Choose SkillPro */}
        <section className="py-16 sm:py-20">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold text-foreground sm:text-4xl">
              Por que escolher a SkillPro?
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <Card className="group transition-all hover:border-primary/50 hover:shadow-lg">
                <CardHeader>
                  <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <CardTitle>Cursos Completos</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Aprenda com conteúdo estruturado e organizado em uma timeline de ensino clara
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="group transition-all hover:border-primary/50 hover:shadow-lg">
                <CardHeader>
                  <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Award className="h-6 w-6" />
                  </div>
                  <CardTitle>Certificação</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Receba certificados reconhecidos ao concluir os cursos com aprovação
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="group transition-all hover:border-primary/50 hover:shadow-lg">
                <CardHeader>
                  <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Users className="h-6 w-6" />
                  </div>
                  <CardTitle>Suporte Especializado</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Aprenda com profissionais experientes e tire suas dúvidas
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="group transition-all hover:border-primary/50 hover:shadow-lg">
                <CardHeader>
                  <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Clock className="h-6 w-6" />
                  </div>
                  <CardTitle>Estude no Seu Ritmo</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Acesse os cursos quando e onde quiser, no seu próprio tempo
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <TestimonialsSection testimonials={testimonials} />
        )}

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 py-20 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-6 text-3xl font-bold sm:text-4xl">
              Pronto para começar sua jornada?
            </h2>
            <p className="mb-8 text-lg text-white/90">
              Junte-se a {students.toLocaleString('pt-BR')} alunos que já transformaram suas carreiras
            </p>
            <Link href="/login">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Criar Conta Grátis
              </Button>
            </Link>
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
