import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

// Força renderização dinâmica (SSR) - evita erro de build sem banco de dados
export const dynamic = 'force-dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function CertificatesPage() {
  const user = await requireAuth();

  const certificates = await prisma.certificate.findMany({
    where: {
      studentId: user.id,
    },
    include: {
      course: {
        select: {
          title: true,
          description: true,
        },
      },
    },
    orderBy: {
      issueDate: "desc",
    },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Meus Certificados</h1>
        <p className="text-gray-600">Visualize e baixe seus certificados de conclusão</p>
      </div>

      {certificates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Award className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="text-gray-500">Você ainda não possui certificados.</p>
            <p className="text-sm text-gray-400">
              Complete cursos e seja aprovado nas provas finais para receber certificados.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {certificates.map((certificate) => (
            <Card key={certificate.id} className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Award className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{certificate.course.title}</CardTitle>
                    <CardDescription>{certificate.course.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Emitido em: {new Date(certificate.issueDate).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Nota Final:</span>
                    <span className="font-semibold text-primary">
                      {certificate.finalScore.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="mb-2 text-xs text-gray-500">Hash do Certificado:</p>
                  <p className="font-mono text-xs font-semibold text-primary">
                    {certificate.certificateHash || certificate.id}
                  </p>
                </div>

                {certificate.pdfUrl ? (
                  <a href={certificate.pdfUrl} target="_blank" rel="noopener noreferrer" className="block">
                    <Button className="w-full" variant="outline">
                      <Award className="mr-2 h-4 w-4" />
                      Ver Certificado
                    </Button>
                  </a>
                ) : (
                  <Button className="w-full" variant="outline" disabled>
                    <Download className="mr-2 h-4 w-4" />
                    Certificado em processamento
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
