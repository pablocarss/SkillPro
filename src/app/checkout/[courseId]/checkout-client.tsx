"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Loader2,
  CreditCard,
  ShieldCheck,
  Lock,
  PlayCircle,
  CheckCircle2,
  Clock,
  Award,
  Infinity,
  HelpCircle
} from "lucide-react";
import Image from "next/image";

interface CheckoutClientProps {
  course: {
    id: string;
    title: string;
    description: string;
    price: number;
    thumbnail: string | null;
  };
  user: {
    name: string;
    email: string;
  };
}

export function CheckoutClient({ course, user }: CheckoutClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleCheckout = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course.id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao processar pagamento");
      }

      const { url } = await response.json();

      if (url) {
        // Redirecionar para Stripe Checkout
        window.location.href = url;
      } else {
        throw new Error("URL de checkout não recebida");
      }
    } catch (error) {
      console.error("Erro no checkout:", error);
      toast({
        title: "Erro ao processar pagamento",
        description: error instanceof Error ? error.message : "Tente novamente mais tarde.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Finalizar Compra</h1>
            <p className="text-muted-foreground">
              Você está prestes a adquirir acesso completo ao curso
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Resumo do Pedido */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resumo do Curso</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-32 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center">
                      {course.thumbnail ? (
                        <Image
                          src={course.thumbnail}
                          alt={course.title}
                          width={128}
                          height={80}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <PlayCircle className="h-8 w-8 text-primary/40" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{course.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {course.description}
                      </p>
                      <div className="mt-3">
                        <span className="text-2xl font-bold text-primary">
                          R$ {course.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dados do Aluno</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Nome</label>
                      <p className="text-foreground">{user.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">E-mail</label>
                      <p className="text-foreground">{user.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* O que está incluído */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    O que você vai receber
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Infinity className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Acesso Vitalício</p>
                        <p className="text-sm text-muted-foreground">
                          Estude quando quiser, sem prazo de expiração
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <PlayCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Todo o Conteúdo do Curso</p>
                        <p className="text-sm text-muted-foreground">
                          Acesso completo a todas as aulas e materiais
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Award className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Certificado Digital</p>
                        <p className="text-sm text-muted-foreground">
                          Receba seu certificado após concluir o curso
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Aprenda no seu Ritmo</p>
                        <p className="text-sm text-muted-foreground">
                          Estude de acordo com sua disponibilidade
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Segurança e Garantia */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-green-900 dark:text-green-100 mb-1">
                          Compra 100% Segura
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Pagamento processado com segurança pelo Stripe. Seus dados de cartão são
                          criptografados e nunca armazenados em nossos servidores.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-3 border-t border-green-200 dark:border-green-800">
                      <Badge className="bg-green-600 hover:bg-green-700 text-white">
                        Pagamento Único
                      </Badge>
                      <Badge variant="outline" className="border-green-600 text-green-700 dark:text-green-300">
                        Sem Mensalidades
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ Rápido */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <HelpCircle className="h-5 w-5" />
                    Perguntas Frequentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium text-sm mb-1">Quando terei acesso ao curso?</p>
                      <p className="text-sm text-muted-foreground">
                        Imediatamente após a confirmação do pagamento. Você receberá um e-mail e poderá
                        começar a estudar na hora.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-sm mb-1">Quais formas de pagamento são aceitas?</p>
                      <p className="text-sm text-muted-foreground">
                        Aceitamos cartões de crédito e débito (Visa, Mastercard, American Express, etc).
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-sm mb-1">Posso cancelar ou pedir reembolso?</p>
                      <p className="text-sm text-muted-foreground">
                        Entre em contato com nosso suporte dentro de 7 dias após a compra para solicitar reembolso.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Resumo do Pagamento */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 border-2 border-primary/20 shadow-lg">
                <CardHeader className="bg-gradient-to-br from-primary/5 to-purple-500/5">
                  <CardTitle>Resumo do Pedido</CardTitle>
                  <CardDescription>Revise os detalhes antes de finalizar</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  {/* Detalhamento do Preço */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Curso</span>
                      <span className="font-medium">R$ {course.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Taxa de processamento</span>
                      <span className="font-medium text-green-600">R$ 0,00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Desconto</span>
                      <span className="font-medium text-green-600">R$ 0,00</span>
                    </div>

                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-semibold text-base">Total a Pagar</span>
                          <p className="text-xs text-muted-foreground">Pagamento único</p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-primary">
                            R$ {course.price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Métodos de Pagamento Aceitos */}
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Métodos aceitos:</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        <CreditCard className="h-3 w-3 mr-1" />
                        Visa
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <CreditCard className="h-3 w-3 mr-1" />
                        Mastercard
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <CreditCard className="h-3 w-3 mr-1" />
                        Amex
                      </Badge>
                    </div>
                  </div>

                  {/* Botão de Checkout */}
                  <Button
                    size="lg"
                    className="w-full text-lg h-14 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                    onClick={handleCheckout}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Redirecionando para o Stripe...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-5 w-5" />
                        Pagar com Segurança
                      </>
                    )}
                  </Button>

                  {/* Informações de Segurança */}
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                      <ShieldCheck className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <p>
                        Pagamento processado de forma segura e criptografada pelo Stripe
                      </p>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Lock className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <p>
                        Seus dados de cartão nunca são armazenados em nossos servidores
                      </p>
                    </div>
                  </div>

                  {/* Termos */}
                  <p className="text-xs text-center text-muted-foreground pt-2 border-t">
                    Ao finalizar a compra, você concorda com nossos{" "}
                    <a href="#" className="text-primary hover:underline">termos de uso</a> e{" "}
                    <a href="#" className="text-primary hover:underline">política de privacidade</a>.
                  </p>
                </CardContent>
              </Card>

              {/* Garantia adicional - Mobile */}
              <div className="mt-4 lg:hidden">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3 text-center">
                      <Award className="h-8 w-8 text-blue-600 flex-shrink-0" />
                      <div className="text-left">
                        <p className="font-semibold text-blue-900 dark:text-blue-100 text-sm">
                          Garantia de 7 Dias
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          Se não gostar, devolvemos seu dinheiro
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
