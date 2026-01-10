"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  BookOpen,
  GraduationCap,
  Target,
  TrendingUp,
  Mail,
  Phone,
  MapPin,
  Send,
  Loader2,
  Briefcase,
  Zap,
  FileCheck,
  MessageSquare,
  Lightbulb,
  Settings,
  Lock,
  Rocket,
  BadgeCheck,
  FileText,
  UsersRound,
  Scale,
} from "lucide-react";

export default function EmpresarialPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    cnpj: "",
    contactName: "",
    email: "",
    phone: "",
    employeeCount: "",
    interest: "",
    message: "",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast({
      title: "Solicitação enviada!",
      description: "Nossa equipe entrará em contato em até 24 horas.",
    });

    setFormData({
      companyName: "",
      cnpj: "",
      contactName: "",
      email: "",
      phone: "",
      employeeCount: "",
      interest: "",
      message: "",
    });
    setIsSubmitting(false);
  };

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
      icon: Users,
      title: "Gestão Centralizada",
      description: "Cadastre e gerencie todos os funcionários em um único painel. Controle acessos, monitore progresso e gere relatórios.",
    },
    {
      icon: BarChart3,
      title: "Analytics Avançado",
      description: "Dashboards completos com métricas de engajamento, conclusão de cursos e desempenho individual e por equipe.",
    },
    {
      icon: Award,
      title: "Certificados Corporativos",
      description: "Certificados personalizados com a marca da sua empresa, validados digitalmente e prontos para compartilhar.",
    },
    {
      icon: BookOpen,
      title: "Catálogo Completo",
      description: "Acesso a todos os cursos da plataforma, com possibilidade de criar trilhas de aprendizado personalizadas.",
    },
    {
      icon: Target,
      title: "Conteúdo Customizado",
      description: "Criamos cursos exclusivos para sua empresa, alinhados com suas necessidades e cultura organizacional.",
    },
    {
      icon: TrendingUp,
      title: "ROI Mensurável",
      description: "Acompanhe o retorno do investimento em treinamento com relatórios detalhados de impacto nos negócios.",
    },
  ];

  const certificationTypes = [
    {
      icon: Lock,
      title: "Normas Regulamentadoras (NRs)",
      description: "Treinamentos obrigatórios de segurança e saúde do trabalho",
      items: ["NR-5 CIPA", "NR-6 EPIs", "NR-10 Eletricidade", "NR-35 Trabalho em Altura"],
    },
    {
      icon: Shield,
      title: "Compliance e LGPD",
      description: "Conformidade com legislação e proteção de dados",
      items: ["Lei Geral de Proteção de Dados", "Prevenção à Lavagem de Dinheiro", "Código de Ética", "Canal de Denúncias"],
    },
    {
      icon: Scale,
      title: "Normas ISO",
      description: "Certificações de qualidade e gestão",
      items: ["ISO 9001 Qualidade", "ISO 14001 Ambiental", "ISO 45001 Segurança", "ISO 27001 Segurança da Informação"],
    },
  ];

  const processSteps = [
    {
      icon: MessageSquare,
      title: "1. Contato Inicial",
      description: "Nossa equipe entra em contato para entender suas necessidades de treinamento",
    },
    {
      icon: Lightbulb,
      title: "2. Diagnóstico",
      description: "Analisamos os gaps de competências e desenhamos um programa personalizado",
    },
    {
      icon: Settings,
      title: "3. Configuração",
      description: "Configuramos a plataforma, importamos funcionários e criamos as trilhas",
    },
    {
      icon: Rocket,
      title: "4. Lançamento",
      description: "Lançamos o programa com comunicação interna e suporte para os usuários",
    },
  ];

  const faqs = [
    {
      question: "Quanto tempo leva para implementar a plataforma?",
      answer: "A implementação básica leva de 3 a 5 dias úteis. Para projetos com conteúdo customizado, o prazo pode variar de 2 a 4 semanas dependendo da complexidade.",
    },
    {
      question: "Posso criar cursos exclusivos para minha empresa?",
      answer: "Sim! Podemos criar cursos exclusivos alinhados com as necessidades específicas da sua empresa, incluindo conteúdo sobre processos internos, cultura organizacional e procedimentos técnicos.",
    },
    {
      question: "Como funciona a acreditação para licitações?",
      answer: "Oferecemos suporte completo para documentação e qualificação técnica exigida em processos licitatórios, incluindo atestados de capacidade técnica e certificações obrigatórias.",
    },
    {
      question: "Os certificados são válidos para órgãos reguladores?",
      answer: "Sim! Todos os certificados são validados digitalmente com hash único e atendem aos requisitos dos principais órgãos reguladores. Podem ser verificados a qualquer momento no nosso sistema.",
    },
    {
      question: "Como funciona o modelo de contratação?",
      answer: "Trabalhamos com pacotes personalizados sob consulta, adequados ao tamanho da sua empresa e às suas necessidades específicas. Entre em contato para receber uma proposta.",
    },
    {
      question: "Posso acompanhar o progresso dos funcionários?",
      answer: "Sim! O painel administrativo oferece visão completa do progresso individual e coletivo, com métricas de engajamento, conclusão de cursos e notas nas avaliações.",
    },
  ];

  const stats = [
    { value: "500+", label: "Empresas Parceiras" },
    { value: "50.000+", label: "Profissionais Certificados" },
    { value: "98%", label: "Taxa de Aprovação" },
    { value: "2M+", label: "Horas de Treinamento" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 py-12 sm:py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
              <Building2 className="h-3 w-3 mr-1" />
              Soluções Corporativas
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6">
              Treinamentos, Certificação e{" "}
              <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Acreditação
              </span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 px-4">
              Soluções completas para capacitar sua equipe, obter certificações obrigatórias
              e garantir acreditação para participar de licitações públicas e privadas.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button size="lg" className="h-12 text-base group" asChild>
                <a href="#contato">
                  Solicitar Proposta
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="h-12 text-base" asChild>
                <a href="#solucoes">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Ver Soluções
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 sm:py-12 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 Pillars */}
      <section id="solucoes" className="py-12 sm:py-16 lg:py-20 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <Badge className="mb-4">
              <GraduationCap className="h-3 w-3 mr-1" />
              Nossas Soluções
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              Soluções Completas para sua Empresa
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Quatro pilares para o desenvolvimento completo da sua organização
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((pillar, index) => {
              const Icon = pillar.icon;
              return (
                <Card
                  key={index}
                  className="border-2 transition-all hover:border-primary/50 hover:shadow-xl group overflow-hidden"
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
        </div>
      </section>

      {/* Certifications */}
      <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <Badge className="mb-4 bg-amber-500/10 text-amber-600">
              <Award className="h-3 w-3 mr-1" />
              Certificações
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              Certificações que sua Empresa Precisa
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Treinamentos obrigatórios para conformidade com normas e regulamentações
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {certificationTypes.map((cert, index) => {
              const Icon = cert.icon;
              return (
                <Card key={index} className="border-2 hover:border-primary/50 hover:shadow-lg transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                        <Icon className="h-6 w-6 text-amber-600" />
                      </div>
                      <CardTitle className="text-lg">{cert.title}</CardTitle>
                    </div>
                    <CardDescription>{cert.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {cert.items.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <Badge className="mb-4">
              <Target className="h-3 w-3 mr-1" />
              Benefícios
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              Por que escolher a SkillPro?
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Oferecemos uma plataforma completa para o desenvolvimento da sua equipe
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="border-2 transition-all hover:border-primary/50 hover:shadow-lg group">
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4 group-hover:bg-primary transition-colors">
                      <Icon className="h-6 w-6 text-primary group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-semibold text-base sm:text-lg mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Implementation Process */}
      <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <Badge className="mb-4">
              <Settings className="h-3 w-3 mr-1" />
              Processo
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              Como Funciona
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Implementação simples e rápida para começar a capacitar sua equipe
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            {processSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-600 mx-auto mb-4 text-white">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing - Sob Consulta */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="border-2 border-primary/20 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 p-6 sm:p-8 text-white text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Briefcase className="h-6 w-6" />
                  <span className="text-lg font-medium">SkillPro Empresarial</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-2">Pacotes Personalizados</h3>
                <p className="text-white/80">Soluções sob medida para sua empresa</p>
              </div>
              <CardContent className="p-6 sm:p-8">
                <div className="grid gap-6 sm:grid-cols-2 mb-8">
                  <div>
                    <h4 className="font-semibold mb-4">Incluso em todos os pacotes:</h4>
                    <ul className="space-y-3">
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
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">Diferenciais:</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Suporte dedicado e consultoria especializada</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Conteúdo personalizado para sua empresa</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Integração com sistemas corporativos</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Gerente de conta dedicado</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/50 border border-dashed mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Valores Sob Consulta</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Os valores são personalizados de acordo com o número de colaboradores,
                    tipos de treinamentos necessários e nível de personalização. Entre em contato
                    para receber uma proposta adequada às necessidades da sua empresa.
                  </p>
                </div>

                <Button className="w-full h-12 text-base group" asChild>
                  <a href="#contato">
                    Solicitar Proposta Personalizada
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <Badge className="mb-4">
              <MessageSquare className="h-3 w-3 mr-1" />
              FAQ
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Tire suas dúvidas sobre a plataforma empresarial
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-base">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contato" className="py-12 sm:py-16 lg:py-20 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <Badge className="mb-4 bg-primary/10 text-primary">
                <Mail className="h-3 w-3 mr-1" />
                Contato
              </Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
                Solicite uma Proposta
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground">
                Preencha o formulário e nossa equipe entrará em contato em até 24 horas
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
              {/* Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardContent className="p-5 sm:p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="companyName">Nome da Empresa *</Label>
                          <Input
                            id="companyName"
                            value={formData.companyName}
                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cnpj">CNPJ</Label>
                          <Input
                            id="cnpj"
                            value={formData.cnpj}
                            onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                            placeholder="00.000.000/0000-00"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="contactName">Nome do Responsável *</Label>
                          <Input
                            id="contactName"
                            value={formData.contactName}
                            onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">E-mail Corporativo *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Telefone *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="(00) 00000-0000"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="employeeCount">Número de Funcionários *</Label>
                          <Input
                            id="employeeCount"
                            value={formData.employeeCount}
                            onChange={(e) => setFormData({ ...formData, employeeCount: e.target.value })}
                            placeholder="Ex: 50"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="interest">Interesse Principal</Label>
                        <Input
                          id="interest"
                          value={formData.interest}
                          onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                          placeholder="Ex: Certificações NR, Treinamentos de equipe, Acreditação para licitações..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Mensagem (opcional)</Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          placeholder="Conte-nos mais sobre suas necessidades de treinamento..."
                          rows={4}
                        />
                      </div>

                      <Button type="submit" className="w-full h-12" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Enviar Solicitação
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-5 sm:p-6 space-y-4">
                    <h3 className="font-semibold text-lg">Contato Direto</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-primary" />
                        <span className="text-sm">empresarial@skillpro.com</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-primary" />
                        <span className="text-sm">(11) 99999-9999</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm">São Paulo, SP</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20">
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Clock className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Resposta Rápida</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Nossa equipe responde todas as solicitações em até 24 horas úteis.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Shield className="h-5 w-5 text-green-600" />
                      <span className="font-semibold">Dados Seguros</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Suas informações são tratadas com total sigilo e segurança.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">SkillPro</span>
          </div>
          <p className="text-sm">
            &copy; {new Date().getFullYear()} SkillPro. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
