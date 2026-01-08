import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, ShoppingCart } from "lucide-react";
import Link from "next/link";

export default async function CheckoutCancelPage({
  searchParams,
}: {
  searchParams: { course_id?: string };
}) {
  // Verificar autenticação
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const courseId = searchParams.course_id;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="mx-auto w-20 h-20 rounded-full bg-orange-500/10 flex items-center justify-center mb-6">
              <XCircle className="h-12 w-12 text-orange-500" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Pagamento Cancelado
            </h1>
            <p className="text-lg text-muted-foreground">
              Sua transação foi cancelada e nenhum valor foi cobrado
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>O que aconteceu?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-left">
              <p className="text-muted-foreground">
                Você cancelou o processo de pagamento ou fechou a janela do checkout.
                Não se preocupe, nenhum valor foi cobrado do seu cartão.
              </p>

              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Dica:</strong> Se você encontrou algum problema durante o checkout,
                  entre em contato com nosso suporte. Estamos aqui para ajudar!
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 flex gap-4 justify-center flex-wrap">
            {courseId && (
              <Link href={`/cursos/${courseId}`}>
                <Button size="lg">
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Voltar para o Curso
                </Button>
              </Link>
            )}
            <Link href="/#cursos">
              <Button size="lg" variant="outline">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Ver Outros Cursos
              </Button>
            </Link>
          </div>

          <div className="mt-8 p-4 rounded-lg bg-muted/30">
            <p className="text-sm text-muted-foreground">
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
