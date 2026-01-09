import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/minio";
import { generateCertificatePDF, generateDigitalSignature } from "@/lib/pdf-converter";
import { createHash } from "crypto";

interface GenerateCertificateParams {
  studentId: string;
  courseId: string;
  createdById: string;
}

interface CertificateResult {
  success: boolean;
  certificate?: any;
  error?: string;
}

export async function generateCertificate({
  studentId,
  courseId,
  createdById,
}: GenerateCertificateParams): Promise<CertificateResult> {
  try {
    // Check if certificate already exists
    const existingCertificate = await prisma.certificate.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
      include: {
        student: true,
        course: true,
      },
    });

    if (existingCertificate) {
      return { success: true, certificate: existingCertificate };
    }

    // Get student data
    const student = await prisma.user.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return { success: false, error: "Student not found" };
    }

    // Get course data
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        certificateTemplate: true,
      },
    });

    if (!course) {
      return { success: false, error: "Course not found" };
    }

    // Check enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    });

    if (!enrollment || enrollment.status !== "APPROVED") {
      return { success: false, error: "Student is not enrolled or not approved" };
    }

    // Get final exam score
    const examAttempt = await prisma.studentExamAttempt.findFirst({
      where: {
        studentId,
        exam: {
          courseId,
        },
        passed: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!examAttempt) {
      return { success: false, error: "Student has not passed the final exam" };
    }

    const finalScore = examAttempt.score;

    // Generate certificate hash
    const issueDate = new Date();
    const certificateHash = createHash("sha256")
      .update(`${studentId}-${courseId}-${issueDate.getTime()}`)
      .digest("hex")
      .substring(0, 16)
      .toUpperCase();

    // Prepare data for certificate
    const certificateData = {
      studentName: student.name,
      studentCpf: student.cpf || "Nao informado",
      courseName: course.title,
      courseDuration: course.duration || "Nao especificada",
      completionDate: issueDate.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      finalScore,
      certificateHash,
    };

    let pdfBuffer: Buffer;
    const fileName = `certificado-${student.name.replace(/\s+/g, "_")}-${course.title.replace(/\s+/g, "_")}.pdf`;

    // Try to use Word template if available, fallback to HTML template
    let template = course.certificateTemplate;

    if (!template) {
      template = await prisma.certificateTemplate.findFirst({
        where: { isDefault: true },
      });
    }

    if (template && template.templateUrl) {
      try {
        // Try Word template conversion
        const { convertDocxToPdf } = await import("@/lib/docx-to-pdf");
        const Docxtemplater = (await import("docxtemplater")).default;
        const PizZip = (await import("pizzip")).default;

        console.log("Using Word template:", template.name);

        const templateResponse = await fetch(template.templateUrl);
        if (!templateResponse.ok) {
          throw new Error("Failed to download template");
        }
        const templateBuffer = Buffer.from(await templateResponse.arrayBuffer());

        const zip = new PizZip(templateBuffer);
        const doc = new Docxtemplater(zip, {
          paragraphLoop: true,
          linebreaks: true,
        });

        const templateData = {
          nome: student.name,
          cpf: student.cpf || "Nao informado",
          curso: course.title,
          carga_horaria: course.duration || "Nao especificada",
          data: issueDate.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }),
          nota: finalScore.toFixed(1),
          hash: certificateHash,
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
        pdfBuffer = await generateCertificatePDF(certificateData);
      }
    } else {
      console.log("No template found, generating PDF directly");
      pdfBuffer = await generateCertificatePDF(certificateData);
    }

    // Generate digital signature
    const signatureData = `${certificateHash}-${studentId}-${courseId}-${finalScore}`;
    const digitalSignature = generateDigitalSignature(
      signatureData,
      process.env.CERTIFICATE_SECRET || "skillpro-secret-key"
    );

    // Upload to MinIO
    const pdfUrl = await uploadFile(
      pdfBuffer,
      fileName,
      "application/pdf",
      "certificates"
    );

    // Create certificate record
    const certificate = await prisma.certificate.create({
      data: {
        certificateHash,
        digitalSignature,
        studentId,
        courseId,
        templateId: template?.id,
        createdById,
        finalScore,
        pdfUrl,
      },
      include: {
        student: true,
        course: true,
        template: true,
      },
    });

    console.log("Certificate generated successfully:", certificate.id);

    return { success: true, certificate };
  } catch (error) {
    console.error("Error generating certificate:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Check if student can generate certificate
export async function canGenerateCertificate(
  studentId: string,
  courseId: string
): Promise<{ canGenerate: boolean; reason?: string; hasExistingCertificate?: boolean }> {
  // Check existing certificate
  const existingCertificate = await prisma.certificate.findUnique({
    where: {
      studentId_courseId: {
        studentId,
        courseId,
      },
    },
  });

  if (existingCertificate) {
    return { canGenerate: false, reason: "Certificate already exists", hasExistingCertificate: true };
  }

  // Check enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId,
        courseId,
      },
    },
  });

  if (!enrollment || enrollment.status !== "APPROVED") {
    return { canGenerate: false, reason: "Not enrolled or not approved" };
  }

  // Check if passed final exam
  const passedExam = await prisma.studentExamAttempt.findFirst({
    where: {
      studentId,
      exam: {
        courseId,
      },
      passed: true,
    },
  });

  if (!passedExam) {
    return { canGenerate: false, reason: "Has not passed the final exam" };
  }

  return { canGenerate: true };
}
