import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, Users } from "lucide-react";

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  level?: string | null;
  duration?: string | null;
  price?: number | null;
  thumbnail?: string | null;
  lessonsCount?: number;
  enrollmentsCount?: number;
}

export function CourseCard({
  id,
  title,
  description,
  level,
  duration,
  price,
  thumbnail,
  lessonsCount = 0,
  enrollmentsCount = 0,
}: CourseCardProps) {
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
    <Link href={`/cursos/${id}`}>
      <Card className="group h-full overflow-hidden transition-all hover:shadow-xl hover:border-primary/50 cursor-pointer">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-primary/40" />
            </div>
          )}
          {/* Badge de preço */}
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
            {price && price > 0 ? (
              <Badge className="bg-green-500 text-white hover:bg-green-600 text-xs sm:text-sm">
                R$ {price.toFixed(2)}
              </Badge>
            ) : (
              <Badge className="bg-primary text-primary-foreground text-xs sm:text-sm">
                GRÁTIS
              </Badge>
            )}
          </div>
        </div>

        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
            {level && (
              <Badge variant={getLevelColor(level)} className="text-xs">
                {level}
              </Badge>
            )}
          </div>
          <CardTitle className="line-clamp-2 text-base sm:text-lg group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
          <CardDescription className="line-clamp-2 text-xs sm:text-sm">
            {description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
          <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
            {duration && (
              <div className="flex items-center gap-1 sm:gap-1.5">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>{duration}</span>
              </div>
            )}
            {lessonsCount > 0 && (
              <div className="flex items-center gap-1 sm:gap-1.5">
                <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>{lessonsCount} aulas</span>
              </div>
            )}
            {enrollmentsCount > 0 && (
              <div className="flex items-center gap-1 sm:gap-1.5">
                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>{enrollmentsCount} alunos</span>
              </div>
            )}
          </div>

          {/* Price Display */}
          <div className="pt-2 sm:pt-3 border-t">
            {price && price > 0 ? (
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">Investimento:</span>
                <div className="text-right">
                  <div className="text-xl sm:text-2xl font-bold text-primary">
                    R$ {price.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    pagamento único
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Badge className="bg-green-500 text-white hover:bg-green-600 text-sm sm:text-lg py-1.5 sm:py-2 px-3 sm:px-4">
                  CURSO GRATUITO
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
