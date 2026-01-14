import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/minio";
import { generateCertificatePDF, generateDigitalSignature } from "@/lib/pdf-converter";
import { createHash } from "crypto";

interface GenerateTrainingCertificateParams {
  userId: string;
  trainingId: string;
  createdById: string;
}

interface TrainingCertificateResult {
  success: boolean;
  certificate?: any;
  error?: string;
}

export async function generateTrainingCertificate({
  userId,
  trainingId,
  createdById,
}: GenerateTrainingCertificateParams): Promise<TrainingCertificateResult> {
  try {
    // Check if certificate already exists
    const existingCertificate = await prisma.trainingCertificate.findUnique({
      where: {
        userId_trainingId: {
          userId,
          trainingId,
        },
      },
      include: {
        user: true,
        training: true,
      },
    });

    if (existingCertificate) {
      return { success: true, certificate: existingCertificate };
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: true,
      },
    });

    if (!user) {
      return { success: false, error: "Usuário não encontrado" };
    }

    // Get training data
    const training = await prisma.training.findUnique({
      where: { id: trainingId },
      include: {
        company: true,
      },
    });

    if (!training) {
      return { success: false, error: "Treinamento não encontrado" };
    }

    // Check enrollment
    const enrollment = await prisma.trainingEnrollment.findUnique({
      where: {
        userId_trainingId: {
          userId,
          trainingId,
        },
      },
    });

    if (!enrollment) {
      return { success: false, error: "Usuário não está matriculado neste treinamento" };
    }

    // Get final exam score
    const examAttempt = await prisma.trainingExamAttempt.findFirst({
      where: {
        userId,
        exam: {
          trainingId,
        },
        passed: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!examAttempt) {
      return { success: false, error: "Usuário não passou na prova final" };
    }

    const finalScore = examAttempt.score;

    // Generate certificate hash
    const issueDate = new Date();
    const certificateHash = createHash("sha256")
      .update(`${userId}-${trainingId}-${issueDate.getTime()}`)
      .digest("hex")
      .substring(0, 16)
      .toUpperCase();

    // Prepare data for certificate
    const certificateData = {
      studentName: user.name,
      studentCpf: user.cpf || "Não informado",
      courseName: training.title,
      courseDuration: training.duration || "Não especificada",
      completionDate: issueDate.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      finalScore,
      certificateHash,
      companyName: training.company?.name || user.company?.name,
    };

    let pdfBuffer: Buffer;
    const fileName = `certificado-treinamento-${user.name.replace(/\s+/g, "_")}-${training.title.replace(/\s+/g, "_")}.pdf`;

    // Try to use company-specific template if available
    let templateUrl: string | null = null;

    if (user.companyId) {
      const companyTemplate = await prisma.trainingCertificateTemplate.findUnique({
        where: {
          trainingId_companyId: {
            trainingId,
            companyId: user.companyId,
          },
        },
      });

      if (companyTemplate) {
        templateUrl = companyTemplate.templateUrl;
      }
    }

    if (templateUrl) {
      try {
        // Try Word template conversion
        const { convertDocxToPdf } = await import("@/lib/docx-to-pdf");
        const Docxtemplater = (await import("docxtemplater")).default;
        const PizZip = (await import("pizzip")).default;

        console.log("Using Word template for training certificate");

        const templateResponse = await fetch(templateUrl);
        if (!templateResponse.ok) {
          throw new Error("Failed to download template");
        }
        const templateBuffer = Buffer.from(await templateResponse.arrayBuffer());

        const zip = new PizZip(templateBuffer);
        const doc = new Docxtemplater(zip, {
          paragraphLoop: true,
          linebreaks: true,
        });

        // Get company data with CNPJ
        const companyData = user.companyId ? await prisma.company.findUnique({
          where: { id: user.companyId },
          select: { name: true, cnpj: true },
        }) : null;

        const trainingCompanyData = training.companyId ? await prisma.company.findUnique({
          where: { id: training.companyId },
          select: { name: true, cnpj: true },
        }) : null;

        const templateData = {
          // Dados do funcionário
          nome: user.name,
          cpf: user.cpf || "Não informado",
          email: user.email || "",

          // Dados do treinamento
          curso: training.title,
          treinamento: training.title,
          descricao: training.description || "",
          carga_horaria: training.duration || "Não especificada",
          nivel: training.level || "",

          // Datas
          data: issueDate.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }),
          data_curta: issueDate.toLocaleDateString("pt-BR"),
          ano: issueDate.getFullYear().toString(),
          mes: issueDate.toLocaleDateString("pt-BR", { month: "long" }),
          dia: issueDate.getDate().toString().padStart(2, "0"),

          // Nota
          nota: finalScore.toFixed(1),
          nota_inteiro: Math.round(finalScore).toString(),

          // Hash e verificação
          hash: certificateHash,
          url_verificacao: `${process.env.NEXTAUTH_URL || "https://skillpro.com.br"}/verificar/${certificateHash}`,

          // Empresa do funcionário
          empresa_funcionario: companyData?.name || user.company?.name || "",
          cnpj_funcionario: companyData?.cnpj || "",

          // Empresa do treinamento (quem oferece)
          empresa: trainingCompanyData?.name || training.company?.name || "",
          cnpj: trainingCompanyData?.cnpj || "",
          empresa_treinamento: trainingCompanyData?.name || training.company?.name || "",
          cnpj_treinamento: trainingCompanyData?.cnpj || "",
        };

        doc.render(templateData);

        const processedDocxBuffer = doc.getZip().generate({
          type: "nodebuffer",
          compression: "DEFLATE",
        });

        console.log("Converting DOCX to PDF...");
        pdfBuffer = await convertDocxToPdf(processedDocxBuffer);
        console.log("PDF conversion completed");
      } catch (templateError) {
        console.error("Error using Word template, falling back to HTML:", templateError);
        // Fallback to HTML template
        pdfBuffer = await generateTrainingCertificatePDF(certificateData);
      }
    } else {
      console.log("No template found, generating PDF directly");
      pdfBuffer = await generateTrainingCertificatePDF(certificateData);
    }

    // Generate digital signature
    const signatureData = `${certificateHash}-${userId}-${trainingId}-${finalScore}`;
    const digitalSignature = generateDigitalSignature(
      signatureData,
      process.env.CERTIFICATE_SECRET || "skillpro-secret-key"
    );

    // Upload to MinIO
    const pdfUrl = await uploadFile(
      pdfBuffer,
      fileName,
      "application/pdf",
      "training-certificates"
    );

    // Create certificate record
    const certificate = await prisma.trainingCertificate.create({
      data: {
        certificateHash,
        digitalSignature,
        userId,
        trainingId,
        createdById,
        finalScore,
        pdfUrl,
      },
      include: {
        user: true,
        training: true,
      },
    });

    // Update enrollment as completed
    await prisma.trainingEnrollment.update({
      where: {
        userId_trainingId: {
          userId,
          trainingId,
        },
      },
      data: {
        completedAt: new Date(),
      },
    });

    console.log("Training certificate generated successfully:", certificate.id);

    return { success: true, certificate };
  } catch (error) {
    console.error("Error generating training certificate:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

// Check if user can generate training certificate
export async function canGenerateTrainingCertificate(
  userId: string,
  trainingId: string
): Promise<{ canGenerate: boolean; reason?: string; hasExistingCertificate?: boolean }> {
  // Check existing certificate
  const existingCertificate = await prisma.trainingCertificate.findUnique({
    where: {
      userId_trainingId: {
        userId,
        trainingId,
      },
    },
  });

  if (existingCertificate) {
    return { canGenerate: false, reason: "Certificado já existe", hasExistingCertificate: true };
  }

  // Check enrollment
  const enrollment = await prisma.trainingEnrollment.findUnique({
    where: {
      userId_trainingId: {
        userId,
        trainingId,
      },
    },
  });

  if (!enrollment) {
    return { canGenerate: false, reason: "Não está matriculado" };
  }

  // Check if passed final exam
  const passedExam = await prisma.trainingExamAttempt.findFirst({
    where: {
      userId,
      exam: {
        trainingId,
      },
      passed: true,
    },
  });

  if (!passedExam) {
    return { canGenerate: false, reason: "Não passou na prova final" };
  }

  return { canGenerate: true };
}

// Generate training certificate PDF (HTML fallback)
async function generateTrainingCertificatePDF(data: {
  studentName: string;
  studentCpf: string;
  courseName: string;
  courseDuration: string;
  completionDate: string;
  finalScore: number;
  certificateHash: string;
  companyName?: string;
}): Promise<Buffer> {
  // Use the generic certificate generator with training-specific styling
  const certificateData = {
    studentName: data.studentName,
    studentCpf: data.studentCpf,
    courseName: data.courseName,
    courseDuration: data.courseDuration,
    completionDate: data.completionDate,
    finalScore: data.finalScore,
    certificateHash: data.certificateHash,
  };

  return generateCertificatePDF(certificateData);
}
