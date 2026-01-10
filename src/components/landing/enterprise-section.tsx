import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Award,
  CheckCircle2,
  ArrowRight,
  Shield,
  Clock,
  Headphones,
  GraduationCap,
  BadgeCheck,
  FileCheck,
  UsersRound,
  Briefcase,
  Target,
  TrendingUp,
  Star,
  FileText,
} from "lucide-react";

export function EnterpriseSection() {
  const pillars = [
    {
      icon: Building2,
      title: "Treinamentos para Empresas",
      description: "Capacitação corporativa personalizada para atender às necessidades específicas do seu negócio",
      features: [
        "Cursos sob demanda",
        "Conteúdo personalizado",
        "Gestão centralizada",
        "Relatórios detalhados",
      ],
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-600 dark:text-blue-400",
    },
    {
      icon: UsersRound,
      title: "Treinamentos para Equipes",
      description: "Desenvolva times de alta performance com trilhas de aprendizado colaborativas e direcionadas",
      features: [
        "Trilhas por departamento",
        "Metas coletivas",
        "Acompanhamento em tempo real",
        "Certificação em grupo",
      ],
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10",
      textColor: "text-purple-600 dark:text-purple-400",
    },
    {
      icon: Award,
      title: "Certificações Obrigatórias",
      description: "Certificações exigidas por órgãos reguladores e normas do setor para sua empresa",
      features: [
        "NRs e normas técnicas",
        "Certificados com validade",
        "Renovação automática",
        "Conformidade garantida",
      ],
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-500/10",
      textColor: "text-amber-600 dark:text-amber-400",
    },
    {
      icon: BadgeCheck,
      title: "Acreditação para Licitações",
      description: "Qualificação técnica e documentação necessária para participar de processos licitatórios",
      features: [
        "Atestados de capacidade",
        "Documentação completa",
        "Conformidade com editais",
        "Suporte especializado",
      ],
      color: "from-emerald-500 to-green-500",
      bgColor: "bg-emerald-500/10",
      textColor: "text-emerald-600 dark:text-emerald-400",
    },
  ];

  const benefits = [
    {
      icon: Target,
      title: "ROI Comprovado",
      description: "Aumento de produtividade e redução de custos com treinamentos",
    },
    {
      icon: TrendingUp,
      title: "Escalabilidade",
      description: "De 10 a 10.000 colaboradores sem perder qualidade",
    },
    {
      icon: Shield,
      title: "Segurança",
      description: "Dados protegidos com criptografia de ponta",
    },
    {
      icon: Star,
      title: "Suporte Premium",
      description: "Atendimento prioritário com gerente de conta dedicado",
    },
  ];

  const stats = [
    { value: "500+", label: "Empresas Parceiras" },
    { value: "50k+", label: "Profissionais Certificados" },
    { value: "98%", label: "Taxa de Aprovação" },
  ];

  return (
    <section id="empresas" className="py-12 sm:py-16 lg:py-24 scroll-mt-16 sm:scroll-mt-20 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14 animate-fade-in-up">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
            <Building2 className="h-3 w-3 mr-1" />
            Soluções Corporativas
          </Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            Treinamentos, Certificação e Acreditação
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto px-4">
            Soluções completas para capacitar sua equipe, obter certificações obrigatórias
            e garantir acreditação para participar de licitações públicas e privadas.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 sm:gap-6 max-w-2xl mx-auto mb-10 sm:mb-14">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-4 rounded-lg bg-background/50 border animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-10 sm:mb-14">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <Card
                key={index}
                className="animate-scale-in border-2 transition-all hover:border-primary/50 hover:shadow-xl group overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`h-1.5 bg-gradient-to-r ${pillar.color}`} />
                <CardContent className="p-5 sm:p-6">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${pillar.bgColor} mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-6 w-6 ${pillar.textColor}`} />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{pillar.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{pillar.description}</p>
                  <ul className="space-y-2">
                    {pillar.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className={`h-4 w-4 flex-shrink-0 ${pillar.textColor}`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Benefits + CTA */}
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          {/* Benefits */}
          <div className="space-y-4">
            <h3 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              Por que escolher a SkillPro?
            </h3>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-lg bg-background/50 border hover:border-primary/30 transition-all"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1">{benefit.title}</h4>
                      <p className="text-xs text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA Card */}
          <div className="animate-fade-in">
            <Card className="border-2 border-primary/20 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 p-5 sm:p-6 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="text-sm sm:text-base font-medium">SkillPro Empresarial</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-1">Pacotes Sob Consulta</h3>
                <p className="text-sm text-white/80">Soluções personalizadas para sua empresa</p>
              </div>
              <CardContent className="p-5 sm:p-6 space-y-5">
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Treinamentos ilimitados para equipes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Certificações obrigatórias (NRs, ISO, etc.)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Acreditação para processos licitatórios</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Painel de gestão e relatórios completos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Suporte dedicado e consultoria especializada</span>
                  </li>
                </ul>

                <div className="p-4 rounded-lg bg-muted/50 border border-dashed">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-sm">Pacotes Personalizados</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Valores e condições sob consulta. Entre em contato para receber uma proposta adequada às necessidades da sua empresa.
                  </p>
                </div>

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
                      Falar com Especialista
                    </Button>
                  </Link>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-3 sm:pt-4 border-t text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>Resposta em 24h</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>Sem compromisso</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Logos de empresas */}
        <div className="mt-12 sm:mt-16 text-center">
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
