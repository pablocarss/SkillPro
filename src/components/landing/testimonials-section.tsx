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
    <section className="py-16 sm:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center animate-fade-in-up">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl mb-4">
            O Que Nossos Alunos Dizem
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Depoimentos de quem está transformando sua carreira com a SkillPro
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.id}
              className="animate-scale-in border-2 transition-all hover:border-primary/50 hover:shadow-lg"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="pt-6">
                {/* Rating */}
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < testimonial.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-muted text-muted"
                      }`}
                    />
                  ))}
                </div>

                {/* Comment */}
                <p className="mb-6 text-sm text-foreground/90 line-clamp-4">
                  "{testimonial.comment}"
                </p>

                {/* Student info */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
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
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 px-6 py-3 text-sm font-medium text-primary">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>Média de 4.9/5.0 em satisfação</span>
          </div>
        </div>
      </div>
    </section>
  );
}
