import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Criando curso de teste completo...\n");

  // Buscar usuários
  const admin = await prisma.user.findUnique({
    where: { email: "admin@skillpro.com" },
  });

  const student = await prisma.user.findUnique({
    where: { email: "student@skillpro.com" },
  });

  if (!admin || !student) {
    console.error("❌ Usuários não encontrados");
    return;
  }

  console.log("✅ Usuários encontrados");
  console.log(`   Admin: ${admin.email}`);
  console.log(`   Student: ${student.email} (CPF: ${student.cpf})\n`);

  // Criar curso de teste
  const course = await prisma.course.create({
    data: {
      title: "Teste de Certificação - React Avançado",
      description: "Curso completo de React para teste de certificação",
      level: "Avançado",
      duration: "20 horas",
      passingScore: 70,
      isPublished: true,
      createdById: admin.id,
      modules: {
        create: [
          {
            title: "Módulo 1 - Fundamentos",
            description: "Fundamentos do React",
            order: 1,
            lessons: {
              create: [
                {
                  title: "Introdução ao React",
                  description: "Conceitos básicos",
                  content: "React é uma biblioteca JavaScript para construir interfaces de usuário.",
                  videoUrl: "https://www.youtube.com/embed/Ke90Tje7VS0",
                  order: 1,
                },
                {
                  title: "Componentes e Props",
                  description: "Trabalhando com componentes",
                  content: "Componentes são blocos de construção reutilizáveis no React.",
                  videoUrl: "https://www.youtube.com/embed/Ke90Tje7VS0",
                  order: 2,
                },
              ],
            },
          },
          {
            title: "Módulo 2 - Hooks",
            description: "React Hooks",
            order: 2,
            lessons: {
              create: [
                {
                  title: "useState e useEffect",
                  description: "Hooks principais",
                  content: "Aprenda a usar useState e useEffect para gerenciar estado e efeitos colaterais.",
                  videoUrl: "https://www.youtube.com/embed/Ke90Tje7VS0",
                  order: 1,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Curso criado: ${course.title}\n`);

  // Criar prova final
  const finalExam = await prisma.finalExam.create({
    data: {
      title: "Prova Final - React Avançado",
      description: "Avaliação final do curso de React",
      courseId: course.id,
      passingScore: 70,
      questions: {
        create: [
          {
            question: "O que é React?",
            order: 1,
            answers: {
              create: [
                { answer: "Uma biblioteca JavaScript", isCorrect: true },
                { answer: "Uma linguagem de programação", isCorrect: false },
                { answer: "Um banco de dados", isCorrect: false },
                { answer: "Um framework CSS", isCorrect: false },
              ],
            },
          },
          {
            question: "O que é JSX?",
            order: 2,
            answers: {
              create: [
                { answer: "Uma extensão de sintaxe JavaScript", isCorrect: true },
                { answer: "Um tipo de banco de dados", isCorrect: false },
                { answer: "Uma biblioteca de estilos", isCorrect: false },
                { answer: "Um servidor web", isCorrect: false },
              ],
            },
          },
          {
            question: "Qual hook é usado para gerenciar estado?",
            order: 3,
            answers: {
              create: [
                { answer: "useState", isCorrect: true },
                { answer: "useContext", isCorrect: false },
                { answer: "useRef", isCorrect: false },
                { answer: "useMemo", isCorrect: false },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Prova final criada com ${3} questões\n`);

  // Matricular estudante
  const enrollment = await prisma.enrollment.create({
    data: {
      studentId: student.id,
      courseId: course.id,
      status: "APPROVED",
    },
  });

  console.log(`✅ Estudante matriculado com status: ${enrollment.status}\n`);

  // Marcar todas as aulas como completadas
  const lessons = await prisma.lesson.findMany({
    where: {
      module: {
        courseId: course.id,
      },
    },
  });

  for (const lesson of lessons) {
    await prisma.lessonProgress.create({
      data: {
        studentId: student.id,
        lessonId: lesson.id,
        completed: true,
        completedAt: new Date(),
      },
    });
  }

  console.log(`✅ ${lessons.length} aulas marcadas como completadas\n`);

  console.log("📋 Resumo do Teste:");
  console.log("─".repeat(60));
  console.log(`📚 Curso: ${course.title}`);
  console.log(`🎓 Aluno: ${student.name} (${student.email})`);
  console.log(`📝 CPF: ${student.cpf}`);
  console.log(`📊 Status: Matriculado e aprovado`);
  console.log(`✓ Aulas: Todas completadas (${lessons.length})`);
  console.log(`📋 Prova: Pronta para ser feita`);
  console.log(`🏆 Nota mínima: ${finalExam.passingScore}%`);
  console.log("─".repeat(60));
  console.log("\n🎯 Próximos passos:");
  console.log("1. Faça login como student@skillpro.com / student123");
  console.log("2. Acesse o curso e faça a prova final");
  console.log("3. Responda corretamente pelo menos 3 questões (100%)");
  console.log("4. O certificado será gerado automaticamente!");
  console.log("5. Acesse 'Certificados' para baixar o PDF\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
