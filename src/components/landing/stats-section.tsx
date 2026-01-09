import { Users, BookOpen, Award, TrendingUp } from "lucide-react";

interface StatsSectionProps {
  stats: {
    students: number;
    courses: number;
    certificates: number;
  };
}

export function StatsSection({ stats }: StatsSectionProps) {
  const displayStats = [
    {
      icon: Users,
      value: stats.students.toLocaleString('pt-BR'),
      label: "Alunos Ativos",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: BookOpen,
      value: stats.courses.toLocaleString('pt-BR'),
      label: "Cursos Disponíveis",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: Award,
      value: stats.certificates.toLocaleString('pt-BR'),
      label: "Certificados Emitidos",
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
    },
    {
      icon: TrendingUp,
      value: "95%",
      label: "Taxa de Satisfação",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
  ];

  return (
    <section className="py-10 sm:py-16 lg:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12 animate-fade-in-up">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            Resultados que Falam por Si
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Milhares de alunos já transformaram suas carreiras com a SkillPro
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-2 lg:grid-cols-4">
          {displayStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="group relative animate-scale-in rounded-xl sm:rounded-2xl border bg-card p-4 sm:p-6 text-center transition-all hover:border-primary/50 hover:shadow-lg"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`mx-auto mb-3 sm:mb-4 flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 sm:h-7 sm:w-7 ${stat.color}`} />
                </div>
                <div className="text-xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="mt-1 sm:mt-2 text-xs sm:text-sm font-medium text-muted-foreground">
                  {stat.label}
                </div>

                {/* Efeito de hover */}
                <div className="absolute inset-0 -z-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/0 to-primary/0 opacity-0 transition-opacity group-hover:from-primary/5 group-hover:to-purple-500/5 group-hover:opacity-100" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
