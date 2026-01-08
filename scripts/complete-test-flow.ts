import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧪 Executando fluxo completo de teste...\n");

  // Buscar curso e aluno
  const course = await prisma.course.findFirst({
    where: {
      title: "Teste de Certificação - React Avançado",
    },
    include: {
      finalExam: {
        include: {
          questions: {
            include: {
              answers: true,
            },
          },
        },
      },
    },
  });

  const student = await prisma.user.findUnique({
    where: { email: "student@skillpro.com" },
  });

  if (!course || !student || !course.finalExam) {
    console.error("❌ Curso, aluno ou prova não encontrados");
    return;
  }

  console.log(`📚 Curso: ${course.title}`);
  console.log(`🎓 Aluno: ${student.name}`);
  console.log(`📝 Prova: ${course.finalExam.questions.length} questões\n`);

  // Preparar respostas corretas
  const answers: Record<string, string> = {};
  let correctCount = 0;

  course.finalExam.questions.forEach((question) => {
    const correctAnswer = question.answers.find((a) => a.isCorrect);
    if (correctAnswer) {
      answers[question.id] = correctAnswer.id;
      correctCount++;
      console.log(`✓ Questão ${question.order}: "${question.question}"`);
      console.log(`  Resposta: "${correctAnswer.answer}"\n`);
    }
  });

  const score = (correctCount / course.finalExam.questions.length) * 100;
  const passed = score >= course.finalExam.passingScore;

  console.log(`📊 Resultado: ${score.toFixed(1)}% (${correctCount}/${course.finalExam.questions.length})`);
  console.log(`${passed ? "✅" : "❌"} Status: ${passed ? "APROVADO" : "REPROVADO"}\n`);

  // Registrar tentativa de prova
  console.log("💾 Registrando tentativa de prova...");
  const attempt = await prisma.studentExamAttempt.create({
    data: {
      studentId: student.id,
      examId: course.finalExam.id,
      score,
      answers,
      passed,
    },
  });

  console.log(`✅ Tentativa registrada (ID: ${attempt.id})\n`);

  if (passed) {
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
      console.log("ℹ️  Certificado já existe");
      console.log(`   Hash: ${existingCertificate.certificateHash}`);
      console.log(`   PDF: ${existingCertificate.pdfUrl || "Em processamento"}\n`);
    } else {
      console.log("🎓 Gerando certificado...");

      // Chamar a API de geração de certificado
      try {
        const response = await fetch("http://localhost:3000/api/certificates/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentId: student.id,
            courseId: course.id,
          }),
        });

        if (response.ok) {
          const certificate = await response.json();
          console.log("✅ Certificado gerado com sucesso!");
          console.log(`   Hash: ${certificate.certificateHash}`);
          console.log(`   PDF: ${certificate.pdfUrl}`);
          console.log(`   Assinatura Digital: ${certificate.digitalSignature ? "✓" : "✗"}`);
          console.log(`\n🔗 Verificar em: http://localhost:3000/verificar/${certificate.certificateHash}`);
        } else {
          const error = await response.text();
          console.error("❌ Erro ao gerar certificado:", error);
        }
      } catch (error) {
        console.error("❌ Erro ao chamar API:", error);
      }
    }
  }

  console.log("\n" + "─".repeat(60));
  console.log("✅ Fluxo completo executado com sucesso!");
  console.log("─".repeat(60));
  console.log("\n🎯 Próximos passos:");
  console.log("1. Acesse: http://localhost:3000/login");
  console.log("2. Login: student@skillpro.com / student123");
  console.log("3. Vá em 'Certificados' para ver e baixar o PDF");
  console.log("4. Use o hash para verificar em /verificar/[hash]\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
