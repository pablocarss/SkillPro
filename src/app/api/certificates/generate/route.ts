import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { uploadFile } from "@/lib/minio";
import { generateCertificatePDF, generateDigitalSignature } from "@/lib/pdf-converter";
import { convertDocxToPdf } from "@/lib/docx-to-pdf";
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { createHash } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { courseId, studentId, templateId } = body;

    // Verify authorization (student can only generate their own certificate)
    if (user.role !== "ADMIN" && user.id !== studentId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get student data
    const student = await prisma.user.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Get course data with certificate template
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        certificateTemplate: true,
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if student completed the course
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    });

    if (!enrollment || enrollment.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Student has not completed this course" },
        { status: 400 }
      );
    }

    // Check if student passed the final exam
    const finalExam = await prisma.finalExam.findUnique({
      where: { courseId },
      include: {
        attempts: {
          where: {
            studentId,
            passed: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    if (!finalExam || finalExam.attempts.length === 0) {
      return NextResponse.json(
        { error: "Student has not passed the final exam" },
        { status: 400 }
      );
    }

    const finalScore = finalExam.attempts[0].score;

    // Check if certificate already exists
    const existingCertificate = await prisma.certificate.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    });

    if (existingCertificate) {
      return NextResponse.json(existingCertificate);
    }

    // Get template (priority: course template > provided templateId > default template)
    let template = course.certificateTemplate;

    if (!template && templateId) {
      template = await prisma.certificateTemplate.findUnique({
        where: { id: templateId },
      });
    }

    if (!template) {
      template = await prisma.certificateTemplate.findFirst({
        where: { isDefault: true },
      });
    }

    // Prepare data for certificate
    const issueDate = new Date();
    const certificateHash = createHash("sha256")
      .update(`${studentId}-${courseId}-${issueDate.getTime()}`)
      .digest("hex")
      .substring(0, 16)
      .toUpperCase();

    const certificateData = {
      studentName: student.name,
      studentCpf: student.cpf || "Não informado",
      courseName: course.title,
      courseDuration: course.duration || "Não especificada",
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
    const contentType = "application/pdf";

    // Check if we have a Word template
    if (template && template.templateUrl) {
      console.log("Using Word template:", template.name);

      // Download template from MinIO
      const templateResponse = await fetch(template.templateUrl);
      if (!templateResponse.ok) {
        throw new Error("Failed to download template");
      }
      const templateBuffer = Buffer.from(await templateResponse.arrayBuffer());

      // Process template with docxtemplater
      const zip = new PizZip(templateBuffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      // Prepare data for template (Word format)
      const templateData = {
        nome: student.name,
        cpf: student.cpf || "Não informado",
        curso: course.title,
        carga_horaria: course.duration || "Não especificada",
        data: issueDate.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
        nota: finalScore.toFixed(1),
        hash: certificateHash,
      };

      doc.render(templateData);

      // Get the processed document as buffer
      const processedDocxBuffer = doc.getZip().generate({
        type: "nodebuffer",
        compression: "DEFLATE",
      });

      // Convert DOCX to PDF
      console.log("Converting DOCX to PDF...");
      pdfBuffer = await convertDocxToPdf(processedDocxBuffer);
      console.log("PDF conversion completed");
    } else {
      console.log("No template found, generating PDF directly");

      // Generate PDF certificate using HTML template
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
      contentType,
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
        createdById: user.id,
        finalScore,
        pdfUrl,
      },
      include: {
        student: true,
        course: true,
        template: true,
      },
    });

    return NextResponse.json(certificate, { status: 201 });
  } catch (error) {
    console.error("Error generating certificate:", error);
    return NextResponse.json(
      { error: "Failed to generate certificate" },
      { status: 500 }
    );
  }
}
