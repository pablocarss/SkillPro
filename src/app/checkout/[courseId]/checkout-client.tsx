"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
  HelpCircle,
  ArrowLeft,
  Tag,
  X,
  Percent,
  QrCode,
  Smartphone
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

interface CouponData {
  code: string;
  discountType: string;
  discountValue: number;
  description?: string;
}

type PaymentMethod = "PIX" | "CARD";

export function CheckoutClient({ course, user }: CheckoutClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PIX");
  const router = useRouter();
  const { toast } = useToast();

  // Calcular desconto
  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === "PERCENTAGE") {
      return (course.price * appliedCoupon.discountValue) / 100;
    }
    return Math.min(appliedCoupon.discountValue, course.price);
  };

  const discount = calculateDiscount();
  const finalPrice = Math.max(0, course.price - discount);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: "Informe o cupom",
        description: "Digite o código do cupom para aplicar.",
        variant: "destructive",
      });
      return;
    }

    setIsApplyingCoupon(true);

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
          courseId: course.id,
          price: course.price
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Cupom inválido");
      }

      setAppliedCoupon(data.coupon);
      toast({
        title: "Cupom aplicado!",
        description: data.coupon.description || `Desconto de ${data.coupon.discountType === "PERCENTAGE" ? `${data.coupon.discountValue}%` : `R$ ${data.coupon.discountValue.toFixed(2)}`} aplicado.`,
      });
    } catch (error) {
      toast({
        title: "Cupom inválido",
        description: error instanceof Error ? error.message : "O cupom informado não é válido.",
        variant: "destructive",
      });
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const handleCheckout = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/payments/abacatepay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course.id,
          couponCode: appliedCoupon?.code,
          paymentMethod: paymentMethod
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao processar pagamento");
      }

      const { paymentUrl } = await response.json();

      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        throw new Error("URL de pagamento não recebida");
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

      <main className="container mx-auto px-4 py-6 sm:py-8 lg:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Botão Voltar */}
          <div className="mb-4 sm:mb-6">
            <Link href="/dashboard/catalog">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar para o catálogo
              </Button>
            </Link>
          </div>

          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Finalizar Compra</h1>
            <p className="text-sm sm:text-base text-muted-foreground px-4">
              Você está prestes a adquirir acesso completo ao curso
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
            {/* Resumo do Pedido */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">Resumo do Curso</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <div className="flex-shrink-0 w-full sm:w-32 h-32 sm:h-20 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center">
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
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base sm:text-lg">{course.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-1">
                        {course.description}
                      </p>
                      <div className="mt-2 sm:mt-3 flex items-center gap-2">
                        <span className="text-xl sm:text-2xl font-bold text-primary">
                          R$ {course.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cupom de Desconto */}
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Tag className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                    Cupom de Desconto
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-sm text-green-800 dark:text-green-200">
                            {appliedCoupon.code}
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400">
                            {appliedCoupon.discountType === "PERCENTAGE"
                              ? `${appliedCoupon.discountValue}% de desconto`
                              : `R$ ${appliedCoupon.discountValue.toFixed(2)} de desconto`
                            }
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveCoupon}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Digite o código do cupom"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="flex-1 uppercase"
                      />
                      <Button
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon}
                        variant="outline"
                      >
                        {isApplyingCoupon ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Aplicar"
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">Dados do Aluno</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-muted-foreground">Nome</label>
                      <p className="text-sm sm:text-base text-foreground">{user.name}</p>
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-muted-foreground">E-mail</label>
                      <p className="text-sm sm:text-base text-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* O que está incluído */}
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                    O que você vai receber
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Infinity className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm sm:text-base">Acesso Vitalício</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Estude quando quiser, sem prazo de expiração
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 sm:gap-3">
                      <PlayCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm sm:text-base">Todo o Conteúdo do Curso</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Acesso completo a todas as aulas e materiais
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Award className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm sm:text-base">Certificado Digital</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Receba seu certificado após concluir o curso
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm sm:text-base">Aprenda no seu Ritmo</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Estude de acordo com sua disponibilidade
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Segurança e Garantia */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
                <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-green-900 dark:text-green-100 mb-1 text-sm sm:text-base">
                          Compra 100% Segura
                        </p>
                        <p className="text-xs sm:text-sm text-green-700 dark:text-green-300">
                          Pagamento processado com segurança pelo AbacatePay. Seus dados são
                          criptografados e nunca armazenados em nossos servidores.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-3 border-t border-green-200 dark:border-green-800">
                      <Badge className="bg-green-600 hover:bg-green-700 text-white text-xs">
                        Pagamento Único
                      </Badge>
                      <Badge variant="outline" className="border-green-600 text-green-700 dark:text-green-300 text-xs">
                        Sem Mensalidades
                      </Badge>
                      <Badge variant="outline" className="border-green-600 text-green-700 dark:text-green-300 text-xs">
                        PIX Instantâneo
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ Rápido */}
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                    Perguntas Frequentes
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <p className="font-medium text-xs sm:text-sm mb-1">Quando terei acesso ao curso?</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Imediatamente após a confirmação do pagamento. Você receberá um e-mail e poderá
                        começar a estudar na hora.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-xs sm:text-sm mb-1">Quais formas de pagamento são aceitas?</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Aceitamos PIX (aprovação instantânea) e cartões de crédito (Visa, Mastercard, Elo).
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-xs sm:text-sm mb-1">Posso cancelar ou pedir reembolso?</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Entre em contato com nosso suporte dentro de 7 dias após a compra para solicitar reembolso.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Resumo do Pagamento */}
            <div className="lg:col-span-1">
              <Card className="lg:sticky lg:top-24 border-2 border-primary/20 shadow-lg">
                <CardHeader className="bg-gradient-to-br from-primary/5 to-purple-500/5 p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">Resumo do Pedido</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Revise os detalhes antes de finalizar</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-4 sm:p-6 pt-4 sm:pt-6">
                  {/* Detalhamento do Preço */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">Curso</span>
                      <span className="font-medium">R$ {course.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">Taxa de processamento</span>
                      <span className="font-medium text-green-600">R$ 0,00</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Percent className="h-3 w-3" />
                          Desconto ({appliedCoupon.code})
                        </span>
                        <span className="font-medium text-green-600">- R$ {discount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-semibold text-sm sm:text-base">Total a Pagar</span>
                          <p className="text-xs text-muted-foreground">Pagamento único</p>
                        </div>
                        <div className="text-right">
                          {appliedCoupon && (
                            <div className="text-xs sm:text-sm text-muted-foreground line-through">
                              R$ {course.price.toFixed(2)}
                            </div>
                          )}
                          <div className="text-2xl sm:text-3xl font-bold text-primary">
                            R$ {finalPrice.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seleção de Método de Pagamento */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Forma de Pagamento</p>
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                      className="space-y-2"
                    >
                      <div
                        className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          paymentMethod === "PIX"
                            ? "border-primary bg-primary/5"
                            : "border-muted hover:border-primary/50"
                        }`}
                        onClick={() => setPaymentMethod("PIX")}
                      >
                        <RadioGroupItem value="PIX" id="pix" />
                        <Label htmlFor="pix" className="flex items-center gap-3 cursor-pointer flex-1">
                          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <QrCode className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">PIX</p>
                            <p className="text-xs text-muted-foreground">Aprovação instantânea</p>
                          </div>
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            Recomendado
                          </Badge>
                        </Label>
                      </div>

                      <div
                        className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          paymentMethod === "CARD"
                            ? "border-primary bg-primary/5"
                            : "border-muted hover:border-primary/50"
                        }`}
                        onClick={() => setPaymentMethod("CARD")}
                      >
                        <RadioGroupItem value="CARD" id="card" />
                        <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <CreditCard className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">Cartão de Crédito</p>
                            <p className="text-xs text-muted-foreground">Visa, Mastercard, Elo</p>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Botão de Checkout */}
                  <Button
                    size="lg"
                    className="w-full text-base sm:text-lg h-12 sm:h-14 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                    onClick={handleCheckout}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                        Redirecionando...
                      </>
                    ) : (
                      <>
                        {paymentMethod === "PIX" ? (
                          <QrCode className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        ) : (
                          <CreditCard className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        )}
                        Pagar com {paymentMethod === "PIX" ? "PIX" : "Cartão"}
                      </>
                    )}
                  </Button>

                  {/* Botão Voltar */}
                  <Link href="/dashboard/catalog" className="block">
                    <Button variant="outline" className="w-full h-10 sm:h-11">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Voltar para o catálogo
                    </Button>
                  </Link>

                  {/* Informações de Segurança */}
                  <div className="space-y-2 pt-3 sm:pt-4 border-t">
                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                      <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <p>
                        Pagamento processado de forma segura pelo AbacatePay
                      </p>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <p>
                        Seus dados nunca são armazenados
                      </p>
                    </div>
                    {paymentMethod === "PIX" && (
                      <div className="flex items-start gap-2 text-xs text-muted-foreground">
                        <Smartphone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <p>
                          Pague com qualquer banco usando o QR Code
                        </p>
                      </div>
                    )}
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
                  <CardContent className="pt-4 p-4">
                    <div className="flex items-center gap-3 text-center">
                      <Award className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
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
