import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  Award,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Shield,
  Clock,
  Headphones,
} from "lucide-react";

export function EnterpriseSection() {
  const benefits = [
    {
      icon: Users,
      title: "Gestão de Equipes",
      description: "Cadastre e gerencie funcionários de forma centralizada",
    },
    {
      icon: BarChart3,
      title: "Relatórios Detalhados",
      description: "Acompanhe o progresso e desempenho de toda a equipe",
    },
    {
      icon: Award,
      title: "Certificados Personalizados",
      description: "Certificados com a marca da sua empresa",
    },
    {
      icon: Shield,
      title: "Conteúdo Exclusivo",
      description: "Treinamentos customizados para sua necessidade",
    },
  ];

  const features = [
    "Pacotes flexíveis de funcionários",
    "Acesso a todos os cursos da plataforma",
    "Dashboard administrativo exclusivo",
    "Suporte prioritário dedicado",
    "Integração com sistemas corporativos",
    "Relatórios de progresso em tempo real",
  ];

  return (
    <section id="empresarial" className="py-10 sm:py-16 lg:py-20 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 animate-fade-in-up">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
            <Building2 className="h-3 w-3 mr-1" />
            Para Empresas
          </Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            Treinamentos Corporativos
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Capacite sua equipe com os melhores cursos e gerencie tudo em um único lugar.
            Soluções personalizadas para o crescimento do seu negócio.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8 xl:gap-12 items-center">
          {/* Coluna esquerda - Benefits */}
          <div className="space-y-4 sm:space-y-6">
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <Card
                    key={index}
                    className="animate-scale-in border-2 transition-all hover:border-primary/50 hover:shadow-lg"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                          <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm sm:text-base mb-1">{benefit.title}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">{benefit.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Coluna direita - CTA Card */}
          <div className="animate-fade-in">
            <Card className="border-2 border-primary/20 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-purple-600 p-4 sm:p-6 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="text-sm sm:text-base font-medium">Plano Empresarial</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-1">Sob Consulta</h3>
                <p className="text-sm text-white/80">Pacotes personalizados para sua empresa</p>
              </div>
              <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <ul className="space-y-2 sm:space-y-3">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="space-y-3">
                  <Link href="/empresarial" className="block">
                    <Button className="w-full h-11 sm:h-12 text-sm sm:text-base group">
                      Solicitar Proposta
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link href="/empresarial#contato" className="block">
                    <Button variant="outline" className="w-full h-10 sm:h-11 text-sm">
                      <Headphones className="mr-2 h-4 w-4" />
                      Falar com Consultor
                    </Button>
                  </Link>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-3 sm:pt-4 border-t text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>Resposta em 24h</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>Dados seguros</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Logos de empresas (placeholder) */}
        <div className="mt-10 sm:mt-16 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
            Empresas que confiam na SkillPro
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 lg:gap-12 opacity-50">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-8 w-20 sm:h-10 sm:w-24 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground"
              >
                Empresa {i}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
