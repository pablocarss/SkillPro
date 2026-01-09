import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

interface Testimonial {
  id: string;
  rating: number;
  comment: string;
  student: {
    name: string;
  };
  course?: {
    title: string;
  } | null;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  if (testimonials.length === 0) {
    return null;
  }

  // Função para gerar iniciais do nome
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <section className="py-10 sm:py-16 lg:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mb-8 sm:mb-12 text-center animate-fade-in-up">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            O Que Nossos Alunos Dizem
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Depoimentos de quem está transformando sua carreira com a SkillPro
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.id}
              className="animate-scale-in border-2 transition-all hover:border-primary/50 hover:shadow-lg"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="pt-5 sm:pt-6 px-4 sm:px-6">
                {/* Rating */}
                <div className="mb-3 sm:mb-4 flex gap-0.5 sm:gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                        i < testimonial.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-muted text-muted"
                      }`}
                    />
                  ))}
                </div>

                {/* Comment */}
                <p className="mb-4 sm:mb-6 text-sm text-foreground/90 line-clamp-4">
                  "{testimonial.comment}"
                </p>

                {/* Student info */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <Avatar className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs sm:text-sm">
                      {getInitials(testimonial.student.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">
                      {testimonial.student.name}
                    </p>
                    {testimonial.course && (
                      <p className="text-xs text-muted-foreground truncate">
                        {testimonial.course.title}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Decoração */}
        <div className="mt-8 sm:mt-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium text-primary">
            <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
            <span>Média de 4.9/5.0 em satisfação</span>
          </div>
        </div>
      </div>
    </section>
  );
}
