import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  // Await searchParams (required in Next.js 15)
  await searchParams;

  // Verificar autenticação
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="mx-auto w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Pagamento Confirmado!
            </h1>
            <p className="text-lg text-muted-foreground">
              Sua inscrição foi processada com sucesso
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Próximos Passos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-left">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium">Acesse seus cursos</p>
                  <p className="text-sm text-muted-foreground">
                    Vá para o dashboard e comece a estudar imediatamente
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium">Acompanhe seu progresso</p>
                  <p className="text-sm text-muted-foreground">
                    Complete as aulas e avaliações para obter seu certificado
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium">Receba seu certificado</p>
                  <p className="text-sm text-muted-foreground">
                    Ao concluir o curso com aprovação, você receberá seu certificado digital
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 flex gap-4 justify-center">
            <Link href="/dashboard/meus-cursos">
              <Button size="lg">Ir para Meus Cursos</Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline">
                Voltar para Home
              </Button>
            </Link>
          </div>

          <div className="mt-8 p-4 rounded-lg bg-muted/30">
            <p className="text-sm text-muted-foreground">
              Um e-mail de confirmação foi enviado para <strong>{session.user.email}</strong>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
