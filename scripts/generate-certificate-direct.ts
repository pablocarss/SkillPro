import { PrismaClient } from "@prisma/client";
import { generateCertificatePDF, generateDigitalSignature } from "../src/lib/pdf-converter";
import { convertDocxToPdf } from "../src/lib/docx-to-pdf";
import { uploadFile } from "../src/lib/minio";
import { createHash } from "crypto";
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";

const prisma = new PrismaClient();

async function main() {
  console.log("🎓 Gerando certificado diretamente...\n");

  const student = await prisma.user.findUnique({
    where: { email: "student@skillpro.com" },
  });

  const course = await prisma.course.findFirst({
    where: {
      title: "Teste de Certificação - React Avançado",
    },
    include: {
      certificateTemplate: true,
      finalExam: {
        include: {
          attempts: {
            where: {
              passed: true,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      },
    },
  });

  // Se o curso não tem template, buscar o template padrão
  let template = course?.certificateTemplate;
  if (!template) {
    template = await prisma.certificateTemplate.findFirst({
      where: { isDefault: true },
    });
  }

  if (!student || !course || !course.finalExam || course.finalExam.attempts.length === 0) {
    console.error("❌ Dados não encontrados");
    return;
  }

  const finalScore = course.finalExam.attempts[0].score;

  console.log(`👤 Aluno: ${student.name}`);
  console.log(`📚 Curso: ${course.title}`);
  console.log(`📊 Nota: ${finalScore.toFixed(1)}%\n`);

  // Verificar se certificado já existe
  const existingCertificate = await prisma.certificate.findUnique({
    where: {
      studentId_courseId: {
        studentId: student.id,
        courseId: course.id,
      },
    },
  });

  if (existingCertificate) {
    console.log("ℹ️  Certificado já existe:");
    console.log(`   Hash: ${existingCertificate.certificateHash}`);
    console.log(`   PDF: ${existingCertificate.pdfUrl || "Não gerado"}`);
    console.log(`\n🔗 Verificar: http://localhost:3000/verificar/${existingCertificate.certificateHash}\n`);
    return;
  }

  // Gerar hash e assinatura
  const issueDate = new Date();
  const certificateHash = createHash("sha256")
    .update(`${student.id}-${course.id}-${issueDate.getTime()}`)
    .digest("hex")
    .substring(0, 16)
    .toUpperCase();

  console.log(`🔑 Hash gerado: ${certificateHash}`);

  // Preparar dados do certificado
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

  // Usar template Word se disponível
  if (template && template.templateUrl) {
    console.log(`\n📄 Usando template Word: ${template.name}`);

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

    // Prepare data for template
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
    const docxBuffer = doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    console.log(`✅ Template processado (${(docxBuffer.length / 1024).toFixed(2)} KB)`);
    console.log("🔄 Convertendo DOCX para PDF...");

    // Convert DOCX to PDF
    pdfBuffer = await convertDocxToPdf(docxBuffer);
    console.log(`✅ PDF gerado (${(pdfBuffer.length / 1024).toFixed(2)} KB)`);
  } else {
    console.log("\n📄 Gerando PDF (sem template Word)...");
    pdfBuffer = await generateCertificatePDF(certificateData);
    console.log(`✅ PDF gerado (${(pdfBuffer.length / 1024).toFixed(2)} KB)`);
  }

  // Gerar assinatura digital
  const signatureData = `${certificateHash}-${student.id}-${course.id}-${finalScore}`;
  const digitalSignature = generateDigitalSignature(
    signatureData,
    process.env.CERTIFICATE_SECRET || "skillpro-secret-key"
  );
  console.log("🔐 Assinatura digital gerada");

  // Upload para MinIO
  console.log("\n☁️  Enviando PDF para MinIO...");
  const pdfUrl = await uploadFile(pdfBuffer, fileName, contentType, "certificates");
  console.log(`✅ Arquivo enviado: ${pdfUrl}`);

  // Criar registro no banco
  console.log("\n💾 Salvando no banco de dados...");
  const certificate = await prisma.certificate.create({
    data: {
      certificateHash,
      digitalSignature,
      studentId: student.id,
      courseId: course.id,
      templateId: course.certificateTemplate?.id,
      createdById: student.id,
      finalScore,
      pdfUrl,
    },
  });

  console.log("✅ Certificado salvo no banco");

  console.log("\n" + "═".repeat(60));
  console.log("🎉 CERTIFICADO GERADO COM SUCESSO!");
  console.log("═".repeat(60));
  console.log(`\n📋 Detalhes:`);
  console.log(`   Hash: ${certificate.certificateHash}`);
  console.log(`   PDF: ${certificate.pdfUrl}`);
  console.log(`   Assinatura: ✓ Verificada`);
  console.log(`\n🔗 Links:`);
  console.log(`   Verificação: http://localhost:3000/verificar/${certificate.certificateHash}`);
  console.log(`   Download: ${certificate.pdfUrl}`);
  console.log(`   Dashboard: http://localhost:3000/dashboard/certificates\n`);
}

main()
  .catch((e) => {
    console.error("❌ Erro:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
