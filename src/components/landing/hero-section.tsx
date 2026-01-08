import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Users2 } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28 lg:py-32">
      {/* Background gradiente radial */}
      <div className="absolute inset-0 -z-10 gradient-radial" />

      <div className="container mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Coluna esquerda - Conteúdo */}
          <div className="flex flex-col gap-8 animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Users2 className="h-4 w-4" />
              <span>Mais de 1.000 alunos certificados</span>
            </div>

            {/* Heading */}
            <div className="flex flex-col gap-4">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Aprenda Novas Habilidades com a{" "}
                <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  SkillPro
                </span>
              </h1>
              <p className="text-lg text-muted-foreground sm:text-xl">
                Plataforma completa de cursos online com certificação reconhecida.
                Aprenda no seu ritmo e transforme sua carreira.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
              <Link href="#cursos">
                <Button size="lg" className="w-full sm:w-auto group">
                  Explorar Cursos
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <Play className="mr-2 h-4 w-4" />
                  Começar Grátis
                </Button>
              </Link>
            </div>

            {/* Stats rápidas */}
            <div className="flex flex-wrap gap-8 pt-4">
              <div className="flex flex-col gap-1">
                <div className="text-3xl font-bold text-foreground">50+</div>
                <div className="text-sm text-muted-foreground">Cursos Disponíveis</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-3xl font-bold text-foreground">95%</div>
                <div className="text-sm text-muted-foreground">Taxa de Satisfação</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-3xl font-bold text-foreground">24/7</div>
                <div className="text-sm text-muted-foreground">Acesso ao Conteúdo</div>
              </div>
            </div>
          </div>

          {/* Coluna direita - Ilustração */}
          <div className="relative animate-fade-in">
            <div className="relative aspect-square lg:aspect-auto">
              {/* Placeholder ilustração - pode substituir por uma imagem real */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20 blur-3xl" />
              <div className="relative flex h-full min-h-[400px] items-center justify-center rounded-2xl border-2 border-primary/20 bg-card/50 p-8 backdrop-blur-sm">
                {/* SVG Ilustração simplificada */}
                <svg
                  viewBox="0 0 400 400"
                  fill="none"
                  className="h-full w-full"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Livro/Laptop */}
                  <rect
                    x="80"
                    y="120"
                    width="240"
                    height="180"
                    rx="12"
                    className="fill-primary/20"
                  />
                  <rect
                    x="100"
                    y="140"
                    width="200"
                    height="120"
                    rx="8"
                    className="fill-background stroke-primary"
                    strokeWidth="2"
                  />

                  {/* Tela do laptop */}
                  <rect
                    x="110"
                    y="150"
                    width="180"
                    height="90"
                    rx="4"
                    className="fill-primary/10"
                  />

                  {/* Play button */}
                  <circle
                    cx="200"
                    cy="195"
                    r="25"
                    className="fill-primary"
                  />
                  <path
                    d="M190 185 L215 195 L190 205 Z"
                    className="fill-background"
                  />

                  {/* Elementos decorativos */}
                  <circle
                    cx="320"
                    cy="100"
                    r="20"
                    className="fill-purple-500/30 animate-pulse"
                  />
                  <circle
                    cx="360"
                    cy="280"
                    r="15"
                    className="fill-pink-500/30 animate-pulse"
                    style={{ animationDelay: "0.5s" }}
                  />
                  <circle
                    cx="60"
                    cy="240"
                    r="25"
                    className="fill-primary/20 animate-pulse"
                    style={{ animationDelay: "1s" }}
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
