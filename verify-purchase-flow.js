require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyPurchaseFlow() {
  console.log('🔍 Verificando fluxo de compra na UI...\n');

  try {
    // 1. Verificar cursos pagos publicados
    console.log('1️⃣ Verificando cursos pagos disponíveis...');
    const paidCourses = await prisma.course.findMany({
      where: {
        isPublished: true,
        price: { gt: 0 },
      },
      select: {
        id: true,
        title: true,
        price: true,
        _count: { select: { enrollments: true } }
      },
      take: 5,
    });

    if (paidCourses.length === 0) {
      console.log('❌ Nenhum curso pago encontrado!');
      return;
    }

    console.log(`✅ Encontrados ${paidCourses.length} cursos pagos:`);
    paidCourses.forEach((course, index) => {
      console.log(`   ${index + 1}. ${course.title} - R$ ${course.price.toFixed(2)}`);
      console.log(`      ID: ${course.id}`);
      console.log(`      Alunos: ${course._count.enrollments}`);
    });
    console.log();

    // 2. Verificar aluno de teste
    console.log('2️⃣ Verificando aluno de teste...');
    const student = await prisma.user.findFirst({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!student) {
      console.log('❌ Nenhum aluno encontrado!');
      return;
    }

    console.log(`✅ Aluno: ${student.name} (${student.email})`);
    console.log(`   ID: ${student.id}\n`);

    // 3. Verificar cursos disponíveis para este aluno (não comprados)
    console.log('3️⃣ Verificando cursos disponíveis no catálogo...');
    const availableCourses = await prisma.course.findMany({
      where: {
        isPublished: true,
        price: { gt: 0 },
        NOT: {
          enrollments: {
            some: { studentId: student.id },
          },
        },
      },
      select: {
        id: true,
        title: true,
        price: true,
      },
    });

    console.log(`✅ Cursos disponíveis para compra: ${availableCourses.length}`);
    availableCourses.forEach((course, index) => {
      console.log(`   ${index + 1}. ${course.title} - R$ ${course.price.toFixed(2)}`);
    });
    console.log();

    // 4. Verificar inscrições pendentes
    console.log('4️⃣ Verificando inscrições pendentes...');
    const pendingEnrollments = await prisma.enrollment.findMany({
      where: {
        studentId: student.id,
        status: 'PENDING',
      },
      include: {
        course: { select: { title: true, price: true } },
        payment: { select: { status: true, amount: true } },
      },
    });

    if (pendingEnrollments.length > 0) {
      console.log(`⚠️  ${pendingEnrollments.length} inscrições pendentes:`);
      pendingEnrollments.forEach((enrollment, index) => {
        console.log(`   ${index + 1}. ${enrollment.course.title}`);
        if (enrollment.payment) {
          console.log(`      Payment: ${enrollment.payment.status} - R$ ${enrollment.payment.amount.toFixed(2)}`);
        }
      });
    } else {
      console.log('✅ Nenhuma inscrição pendente');
    }
    console.log();

    // 5. Resumo e instruções
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 RESUMO DO FLUXO DE COMPRA:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🔐 PASSO 1: Login');
    console.log(`   URL: http://localhost:3000/login`);
    console.log(`   Email: ${student.email}`);
    console.log(`   Senha: [sua senha]\n`);

    console.log('📚 PASSO 2: Acessar Catálogo');
    console.log('   URL: http://localhost:3000/dashboard/catalog');
    console.log('   Ou clique em "Todos os Cursos" no menu lateral\n');

    console.log('🎯 PASSO 3: Selecionar Curso Pago');
    if (availableCourses.length > 0) {
      const course = availableCourses[0];
      console.log(`   Exemplo: ${course.title} - R$ ${course.price.toFixed(2)}`);
      console.log(`   Botão deve mostrar: "💳 Comprar Agora"\n`);
    }

    console.log('💳 PASSO 4: Clicar em "Comprar Agora"');
    if (availableCourses.length > 0) {
      console.log(`   Será redirecionado para: http://localhost:3000/checkout/${availableCourses[0].id}\n`);
    }

    console.log('✅ PASSO 5: Finalizar Compra');
    console.log('   Clique em "Pagar com Segurança"');
    console.log('   Será redirecionado para Stripe Checkout\n');

    console.log('💡 VERIFICAÇÕES IMPORTANTES:');
    console.log('   ✓ Na página de catálogo, cursos PAGOS devem mostrar:');
    console.log('     - Badge verde "Pago"');
    console.log('     - Preço em destaque (ex: R$ 199.90)');
    console.log('     - Botão "💳 Comprar Agora" (não "Inscrever-se Grátis")');
    console.log('   ✓ Cursos GRATUITOS devem mostrar:');
    console.log('     - Badge "Gratuito"');
    console.log('     - Botão "Inscrever-se Grátis"\n');

    console.log('🧪 TESTE DO CARTÃO STRIPE:');
    console.log('   Número: 4242 4242 4242 4242');
    console.log('   Data: qualquer futura (ex: 12/25)');
    console.log('   CVC: qualquer 3 dígitos (ex: 123)\n');

  } catch (error) {
    console.error('❌ ERRO:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyPurchaseFlow();
