"use client";

import { useState } from "react";
import { CourseCard } from "@/components/course-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  BookOpen,
  Sparkles,
  TrendingUp,
  Clock,
  Users,
  Filter,
} from "lucide-react";
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

interface CoursesCatalogSectionProps {
  courses: Course[];
  stats: {
    totalCourses: number;
    totalStudents: number;
    totalCertificates: number;
  };
}

const categories = [
  { id: "all", label: "Todos", icon: Sparkles },
  { id: "BEGINNER", label: "Iniciante", icon: BookOpen },
  { id: "INTERMEDIATE", label: "Intermediário", icon: TrendingUp },
  { id: "ADVANCED", label: "Avançado", icon: Users },
];

export function CoursesCatalogSection({ courses, stats }: CoursesCatalogSectionProps) {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredCourses =
    activeCategory === "all"
      ? courses
      : courses.filter((course) => course.level === activeCategory);

  if (courses.length === 0) {
    return null;
  }

  return (
    <section
      id="cursos"
      className="py-12 sm:py-16 lg:py-20 scroll-mt-16 sm:scroll-mt-20 bg-gradient-to-b from-background via-muted/20 to-background"
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14 animate-fade-in-up">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
            <BookOpen className="h-3 w-3 mr-1" />
            Catálogo de Cursos
          </Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            Explore Nossos Cursos
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Cursos completos desenvolvidos por especialistas para impulsionar sua carreira
          </p>

          {/* Stats Mini */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4 text-primary" />
              <span>
                <strong className="text-foreground">{stats.totalCourses}</strong> cursos
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4 text-primary" />
              <span>
                <strong className="text-foreground">{stats.totalStudents.toLocaleString("pt-BR")}</strong> alunos
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span>
                <strong className="text-foreground">{stats.totalCertificates.toLocaleString("pt-BR")}</strong> certificados
              </span>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              return (
                <Button
                  key={category.id}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(category.id)}
                  className={`h-9 px-4 transition-all ${
                    isActive
                      ? "shadow-md"
                      : "hover:border-primary/50"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 mr-1.5" />
                  {category.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCourses.slice(0, 8).map((course, index) => {
            const lessonsCount = course.modules.reduce(
              (total, module) => total + module.lessons.length,
              0
            );

            return (
              <div
                key={course.id}
                className="animate-scale-in"
                style={{ animationDelay: `${index * 0.05}s` }}
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

        {/* No results message */}
        {filteredCourses.length === 0 && (
          <Card className="max-w-md mx-auto mt-8">
            <CardContent className="p-8 text-center">
              <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">Nenhum curso encontrado</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Não há cursos nesta categoria no momento
              </p>
              <Button
                variant="outline"
                onClick={() => setActiveCategory("all")}
              >
                Ver todos os cursos
              </Button>
            </CardContent>
          </Card>
        )}

        {/* CTA */}
        {filteredCourses.length > 0 && (
          <div className="text-center mt-10 sm:mt-12">
            <Link href="/cursos">
              <Button size="lg" variant="outline" className="group h-12 px-8">
                Ver Catálogo Completo
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Explore todos os {stats.totalCourses} cursos disponíveis
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
