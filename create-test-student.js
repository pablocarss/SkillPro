require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestStudent() {
  console.log('👤 Criando aluno de teste para verificar fluxo de compra...\n');

  try {
    // Verificar se já existe
    const existing = await prisma.user.findUnique({
      where: { email: 'teste.compra@skillpro.com' }
    });

    if (existing) {
      console.log('⚠️  Aluno de teste já existe!');
      console.log(`   Nome: ${existing.name}`);
      console.log(`   Email: ${existing.email}`);
      console.log(`   ID: ${existing.id}\n`);

      // Verificar enrollments
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: existing.id },
        include: { course: { select: { title: true } } }
      });

      if (enrollments.length > 0) {
        console.log(`   Inscrições: ${enrollments.length}`);
        enrollments.forEach((e, i) => {
          console.log(`   ${i + 1}. ${e.course.title} - ${e.status}`);
        });
      } else {
        console.log('   Nenhuma inscrição ainda ✓');
      }

      console.log('\n📝 CREDENCIAIS DE LOGIN:');
      console.log('   Email: teste.compra@skillpro.com');
      console.log('   Senha: Teste@123\n');

      return;
    }

    // Criar novo aluno
    const hashedPassword = await bcrypt.hash('Teste@123', 10);

    const student = await prisma.user.create({
      data: {
        name: 'Aluno Teste Compra',
        email: 'teste.compra@skillpro.com',
        password: hashedPassword,
        cpf: '12345678901',
        birthDate: new Date('1990-01-01'),
        phone: '(11) 99999-9999',
        role: 'STUDENT',
      },
    });

    console.log('✅ Aluno de teste criado com sucesso!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 CREDENCIAIS DE LOGIN:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Nome: ${student.name}`);
    console.log(`   Email: ${student.email}`);
    console.log(`   Senha: Teste@123`);
    console.log(`   ID: ${student.id}\n`);

    // Verificar cursos pagos disponíveis
    const paidCourses = await prisma.course.findMany({
      where: {
        isPublished: true,
        price: { gt: 0 },
      },
      select: {
        id: true,
        title: true,
        price: true,
      },
      take: 3,
    });

    console.log('💰 CURSOS PAGOS DISPONÍVEIS PARA TESTE:');
    paidCourses.forEach((course, index) => {
      console.log(`   ${index + 1}. ${course.title} - R$ ${course.price.toFixed(2)}`);
    });
    console.log();

    console.log('🧪 COMO TESTAR O FLUXO DE COMPRA:');
    console.log('   1. Acesse: http://localhost:3000/login');
    console.log('   2. Faça login com as credenciais acima');
    console.log('   3. Clique em "Todos os Cursos" no menu lateral');
    console.log('   4. Você verá cursos PAGOS com botão "💳 Comprar Agora"');
    console.log('   5. Clique em "Comprar Agora" em qualquer curso pago');
    console.log('   6. Será redirecionado para a página de checkout');
    console.log('   7. Clique em "Pagar com Segurança"');
    console.log('   8. Será redirecionado para o Stripe Checkout\n');

    console.log('💳 CARTÃO DE TESTE STRIPE:');
    console.log('   Número: 4242 4242 4242 4242');
    console.log('   Data: 12/25 (qualquer data futura)');
    console.log('   CVC: 123 (qualquer 3 dígitos)\n');

  } catch (error) {
    console.error('❌ ERRO:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestStudent();
