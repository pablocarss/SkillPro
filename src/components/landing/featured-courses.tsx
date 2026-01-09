import { CourseCard } from "@/components/course-card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface Course {
  id: string;
  title: string;
  description: string;
  level?: string | null;
  duration?: string | null;
  price?: number | null;
  thumbnail?: string | null;
  _count: {
    enrollments: number;
  };
  modules: Array<{
    lessons: Array<{ id: string }>;
  }>;
}

interface FeaturedCoursesProps {
  courses: Course[];
}

export function FeaturedCourses({ courses }: FeaturedCoursesProps) {
  if (courses.length === 0) {
    return null;
  }

  return (
    <section id="cursos" className="py-10 sm:py-16 lg:py-20 scroll-mt-16 sm:scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="mb-8 sm:mb-12 flex flex-col gap-4 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left animate-fade-in-up">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
              Cursos em Destaque
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              Explore nossos cursos mais populares e comece a aprender hoje
            </p>
          </div>
          <Link href="/cursos" className="mx-auto sm:mx-0">
            <Button variant="outline" className="group text-sm sm:text-base">
              Ver Todos os Cursos
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, index) => {
            // Calcular total de aulas
            const lessonsCount = course.modules.reduce(
              (total, module) => total + module.lessons.length,
              0
            );

            return (
              <div
                key={course.id}
                className="animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
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
      </div>
    </section>
  );
}
