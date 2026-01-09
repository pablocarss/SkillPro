import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, ShoppingCart, CreditCard, HelpCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

export default async function CheckoutCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ course_id?: string; reason?: string }>;
}) {
  const { course_id, reason } = await searchParams;

  // Verificar autenticação
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const courseId = course_id;

  // Mensagens baseadas no motivo
  const getReasonMessage = (reason?: string) => {
    switch (reason) {
      case "declined":
        return {
          title: "Pagamento Recusado",
          description: "Seu cartão foi recusado. Verifique os dados e tente novamente.",
          icon: CreditCard,
          color: "text-red-500",
          bgColor: "bg-red-500/10"
        };
      case "expired":
        return {
          title: "Sessão Expirada",
          description: "A sessão de pagamento expirou. Por favor, tente novamente.",
          icon: RefreshCw,
          color: "text-yellow-500",
          bgColor: "bg-yellow-500/10"
        };
      case "error":
        return {
          title: "Erro no Pagamento",
          description: "Ocorreu um erro ao processar o pagamento. Tente novamente mais tarde.",
          icon: HelpCircle,
          color: "text-red-500",
          bgColor: "bg-red-500/10"
        };
      default:
        return {
          title: "Pagamento Cancelado",
          description: "Sua transação foi cancelada e nenhum valor foi cobrado.",
          icon: XCircle,
          color: "text-orange-500",
          bgColor: "bg-orange-500/10"
        };
    }
  };

  const messageInfo = getReasonMessage(reason);
  const IconComponent = messageInfo.icon;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-6 sm:mb-8">
            <div className={`mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full ${messageInfo.bgColor} flex items-center justify-center mb-4 sm:mb-6`}>
              <IconComponent className={`h-10 w-10 sm:h-12 sm:w-12 ${messageInfo.color}`} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              {messageInfo.title}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground px-4">
              {messageInfo.description}
            </p>
          </div>

          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">O que você pode fazer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-left p-4 sm:p-6 pt-0">
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-primary/10 text-xs sm:text-sm font-semibold text-primary flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium text-sm sm:text-base">Tente novamente</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Verifique os dados do cartão e tente fazer o pagamento novamente
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-primary/10 text-xs sm:text-sm font-semibold text-primary flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium text-sm sm:text-base">Use outro cartão</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Se o problema persistir, tente usar outro cartão de crédito ou débito
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-primary/10 text-xs sm:text-sm font-semibold text-primary flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium text-sm sm:text-base">Entre em contato</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Fale com nosso suporte se precisar de ajuda ou tiver dúvidas
                  </p>
                </div>
              </div>

              <div className="bg-muted/30 p-3 sm:p-4 rounded-lg mt-4">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  <strong>Importante:</strong> Nenhum valor foi cobrado do seu cartão.
                  Você pode tentar realizar a compra novamente a qualquer momento.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            {courseId && (
              <>
                <Link href={`/checkout/${courseId}`} className="w-full sm:w-auto">
                  <Button size="lg" className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Tentar Novamente
                  </Button>
                </Link>
                <Link href={`/cursos/${courseId}`} className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Voltar para o Curso
                  </Button>
                </Link>
              </>
            )}
            {!courseId && (
              <Link href="/#cursos" className="w-full sm:w-auto">
                <Button size="lg" className="w-full">
                  <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Ver Cursos
                </Button>
              </Link>
            )}
          </div>

          <div className="mt-6 sm:mt-8 p-3 sm:p-4 rounded-lg bg-muted/30">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Precisa de ajuda? Entre em contato pelo e-mail:{" "}
              <a href="mailto:suporte@skillpro.com" className="text-primary hover:underline">
                suporte@skillpro.com
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
