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
    message: "",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simular envio
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
      message: "",
    });
    setIsSubmitting(false);
  };

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

  const plans = [
    {
      name: "Starter",
      employees: "Até 25 funcionários",
      price: "R$ 1.999",
      period: "/mês",
      features: [
        "Acesso a todos os cursos",
        "Painel administrativo",
        "Relatórios básicos",
        "Suporte por email",
        "Certificados padrão",
      ],
      highlighted: false,
    },
    {
      name: "Business",
      employees: "Até 100 funcionários",
      price: "R$ 4.999",
      period: "/mês",
      features: [
        "Tudo do Starter",
        "Relatórios avançados",
        "Certificados personalizados",
        "Suporte prioritário",
        "Trilhas customizadas",
        "Gerente de conta dedicado",
      ],
      highlighted: true,
    },
    {
      name: "Enterprise",
      employees: "Funcionários ilimitados",
      price: "Sob consulta",
      period: "",
      features: [
        "Tudo do Business",
        "Cursos exclusivos",
        "API de integração",
        "SLA garantido",
        "Onboarding dedicado",
        "Treinamento presencial",
      ],
      highlighted: false,
    },
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
              Treinamentos Corporativos
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6">
              Capacite sua equipe com a{" "}
              <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                SkillPro Empresarial
              </span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 px-4">
              Soluções completas de treinamento para empresas de todos os tamanhos.
              Gerencie, acompanhe e desenvolva sua equipe em um único lugar.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button size="lg" className="h-12 text-base group">
                Solicitar Demonstração
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline" className="h-12 text-base">
                <Headphones className="mr-2 h-4 w-4" />
                Falar com Consultor
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
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
                <Card key={index} className="border-2 transition-all hover:border-primary/50 hover:shadow-lg">
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                      <Icon className="h-6 w-6 text-primary" />
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

      {/* Plans */}
      <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              Planos Empresariais
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Escolha o plano ideal para o tamanho da sua empresa
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`border-2 transition-all ${
                  plan.highlighted
                    ? "border-primary shadow-xl scale-105"
                    : "hover:border-primary/50 hover:shadow-lg"
                }`}
              >
                {plan.highlighted && (
                  <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium">
                    Mais Popular
                  </div>
                )}
                <CardHeader className="p-5 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.employees}</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl sm:text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="p-5 sm:p-6 pt-0">
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${plan.highlighted ? "" : "variant-outline"}`}
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    {plan.price === "Sob consulta" ? "Falar com Vendas" : "Começar Agora"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contato" className="py-12 sm:py-16 lg:py-20 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
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
