import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, CheckCircle, XCircle, Calendar, User, BookOpen, TrendingUp, Shield, Download, Building2, Briefcase } from "lucide-react";
import Link from "next/link";
import { verifyDigitalSignature } from "@/lib/pdf-converter";

interface PageProps {
  params: Promise<{ hash: string }>;
}

export default async function VerificarCertificadoPage({ params }: PageProps) {
  const { hash } = await params;
  const hashUpper = hash.toUpperCase();

  // Buscar certificado de curso EAD pelo hash
  const courseCertificate = await prisma.certificate.findUnique({
    where: {
      certificateHash: hashUpper,
    },
    include: {
      student: {
        select: {
          name: true,
          cpf: true,
        },
      },
      course: {
        select: {
          title: true,
          description: true,
          duration: true,
          level: true,
        },
      },
    },
  });

  // Buscar certificado de treinamento pelo hash
  const trainingCertificate = await prisma.trainingCertificate.findUnique({
    where: {
      certificateHash: hashUpper,
    },
    include: {
      user: {
        select: {
          name: true,
          cpf: true,
        },
      },
      training: {
        select: {
          title: true,
          description: true,
          duration: true,
          level: true,
          company: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  // Verificar se encontrou algum certificado
  const certificate = courseCertificate || trainingCertificate;
  const isTrainingCertificate = !!trainingCertificate;

  if (!certificate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 rounded-full bg-red-100 p-4 w-fit">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Certificado Não Encontrado</CardTitle>
            <CardDescription>
              O hash fornecido não corresponde a nenhum certificado em nosso sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-gray-100 p-4">
              <p className="text-sm text-gray-600">Hash procurado:</p>
              <p className="font-mono text-sm font-semibold">{hash.toUpperCase()}</p>
            </div>
            <p className="text-sm text-gray-600">
              Verifique se o hash foi digitado corretamente ou entre em contato com a instituição
              que emitiu o certificado.
            </p>
            <Link href="/" className="block">
              <Button className="w-full">Voltar para Página Inicial</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Preparar dados para exibição
  const studentName = isTrainingCertificate
    ? trainingCertificate!.user.name
    : courseCertificate!.student.name;
  const studentCpf = isTrainingCertificate
    ? trainingCertificate!.user.cpf
    : courseCertificate!.student.cpf;
  const courseTitle = isTrainingCertificate
    ? trainingCertificate!.training.title
    : courseCertificate!.course.title;
  const courseDescription = isTrainingCertificate
    ? trainingCertificate!.training.description
    : courseCertificate!.course.description;
  const courseDuration = isTrainingCertificate
    ? trainingCertificate!.training.duration
    : courseCertificate!.course.duration;
  const courseLevel = isTrainingCertificate
    ? trainingCertificate!.training.level
    : courseCertificate!.course.level;
  const companyName = isTrainingCertificate
    ? trainingCertificate!.training.company?.name
    : null;
  const relatedId = isTrainingCertificate
    ? trainingCertificate!.trainingId
    : courseCertificate!.courseId;
  const userId = isTrainingCertificate
    ? trainingCertificate!.userId
    : courseCertificate!.studentId;

  // Verificar assinatura digital
  const signatureData = `${certificate.certificateHash}-${userId}-${relatedId}-${certificate.finalScore}`;
  const isSignatureValid = certificate.digitalSignature
    ? verifyDigitalSignature(
        signatureData,
        certificate.digitalSignature,
        process.env.CERTIFICATE_SECRET || "skillpro-secret-key"
      )
    : false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 py-12">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600">
            <Award className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Verificação de Certificado</h1>
          <p className="mt-2 text-gray-600">Sistema de Validação SkillPro</p>
        </div>

        {/* Status Card */}
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 p-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-green-900">Certificado Válido</CardTitle>
                  <CardDescription className="text-green-700">
                    Este certificado foi verificado e é autêntico
                  </CardDescription>
                </div>
              </div>
              {isSignatureValid && (
                <div className="rounded-full bg-blue-100 p-2" title="Assinatura Digital Verificada">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Certificate Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {isTrainingCertificate ? "Informações do Funcionário" : "Informações do Aluno"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Nome Completo</p>
              <p className="text-lg font-semibold text-gray-900">{studentName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">CPF</p>
              <p className="font-mono text-gray-900">{studentCpf || "Não informado"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Course/Training Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isTrainingCertificate ? (
                <Briefcase className="h-5 w-5" />
              ) : (
                <BookOpen className="h-5 w-5" />
              )}
              {isTrainingCertificate ? "Informações do Treinamento" : "Informações do Curso"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">{isTrainingCertificate ? "Treinamento" : "Curso"}</p>
              <p className="text-lg font-semibold text-gray-900">{courseTitle}</p>
            </div>
            {courseDescription && (
              <div>
                <p className="text-sm text-gray-600">Descrição</p>
                <p className="text-gray-700">{courseDescription}</p>
              </div>
            )}
            {companyName && (
              <div>
                <p className="text-sm text-gray-600">Empresa</p>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <p className="font-semibold text-gray-900">{companyName}</p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Carga Horária</p>
                <p className="font-semibold text-gray-900">{courseDuration || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Nível</p>
                <p className="font-semibold text-gray-900">{courseLevel || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Desempenho
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Nota Final</p>
              <p className="text-3xl font-bold text-blue-600">{certificate.finalScore.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Data de Conclusão</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <p className="font-semibold text-gray-900">
                  {new Date(certificate.issueDate).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Details */}
        <Card className="border-gray-200 bg-gray-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Detalhes Técnicos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Hash do Certificado</p>
              <p className="font-mono text-sm font-semibold text-gray-900">
                {certificate.certificateHash}
              </p>
            </div>
            {isSignatureValid && (
              <div>
                <p className="text-sm text-gray-600">Status da Assinatura Digital</p>
                <div className="mt-1 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <p className="text-sm font-semibold text-green-700">Assinatura Verificada</p>
                </div>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">ID do Certificado</p>
              <p className="font-mono text-xs text-gray-700">{certificate.id}</p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        {certificate.pdfUrl && (
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="pt-6">
              <a href={certificate.pdfUrl} target="_blank" rel="noopener noreferrer" className="block">
                <Button className="w-full" size="lg">
                  <Award className="mr-2 h-5 w-5" />
                  Ver Certificado
                </Button>
              </a>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-600">
          <p>
            Este certificado foi emitido por <strong>SkillPro Educação</strong>
          </p>
          <p className="mt-1">
            Em caso de dúvidas sobre a autenticidade, entre em contato conosco.
          </p>
        </div>
      </div>
    </div>
  );
}
