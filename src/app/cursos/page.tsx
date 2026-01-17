import { Navbar } from "@/components/navbar";
import { CourseCard } from "@/components/course-card";
import { prisma } from "@/lib/prisma";

// Força renderização dinâmica (SSR) - evita erro de build sem banco de dados
export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Todos os Cursos - SkillPro",
  description: "Explore todos os cursos disponíveis na SkillPro e encontre o perfeito para você",
};

export default async function AllCoursesPage() {
  // Buscar todos os cursos publicados
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    include: {
      _count: { select: { enrollments: true } },
      modules: {
        include: {
          lessons: { select: { id: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 py-8 sm:py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4">
                Todos os Cursos
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground px-4">
                Explore nossa coleção completa de {courses.length} cursos e encontre o perfeito para você
              </p>
            </div>
          </div>
        </section>

        {/* Courses Grid */}
        <section className="py-8 sm:py-12 lg:py-16">
          <div className="container mx-auto px-4">
            {courses.length > 0 ? (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {courses.map((course, index) => {
                  const lessonsCount = course.modules.reduce(
                    (total, module) => total + module.lessons.length,
                    0
                  );

                  return (
                    <div
                      key={course.id}
                      className="animate-scale-in"
                      style={{ animationDelay: `${(index % 12) * 0.05}s` }}
                    >
                      <CourseCard
                        id={course.id}
                        title={course.title}
                        description={course.description}
                        level={course.level}
                        duration={course.duration}
                        price={course.price}
                        thumbnail={course.thumbnail}
                        lessonsCount={lessonsCount}
                        enrollmentsCount={course._count.enrollments}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-lg text-muted-foreground">
                  Nenhum curso disponível no momento.
                </p>
              </div>
            )}
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
