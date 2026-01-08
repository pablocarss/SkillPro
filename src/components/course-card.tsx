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
              <BookOpen className="h-16 w-16 text-primary/40" />
            </div>
          )}
          {/* Badge de preço */}
          <div className="absolute top-3 right-3">
            {price && price > 0 ? (
              <Badge className="bg-green-500 text-white hover:bg-green-600">
                R$ {price.toFixed(2)}
              </Badge>
            ) : (
              <Badge className="bg-primary text-primary-foreground">
                GRÁTIS
              </Badge>
            )}
          </div>
        </div>

        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            {level && (
              <Badge variant={getLevelColor(level)} className="text-xs">
                {level}
              </Badge>
            )}
          </div>
          <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
          <CardDescription className="line-clamp-2">
            {description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {duration && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{duration}</span>
              </div>
            )}
            {lessonsCount > 0 && (
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                <span>{lessonsCount} aulas</span>
              </div>
            )}
            {enrollmentsCount > 0 && (
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span>{enrollmentsCount} alunos</span>
              </div>
            )}
          </div>

          {/* Price Display */}
          <div className="pt-2 border-t">
            {price && price > 0 ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Investimento:</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    R$ {price.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    pagamento único
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Badge className="bg-green-500 text-white hover:bg-green-600 text-lg py-2 px-4">
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
