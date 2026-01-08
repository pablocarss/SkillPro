require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const Stripe = require('stripe');

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function testCheckoutFlow() {
  console.log('🛒 Testando fluxo completo de checkout...\n');

  try {
    // 1. Buscar um curso pago do banco
    console.log('1️⃣ Buscando curso pago no banco de dados...');
    const course = await prisma.course.findFirst({
      where: {
        isPublished: true,
        price: { gt: 0 },
      },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
      },
    });

    if (!course) {
      console.log('❌ Nenhum curso pago encontrado!');
      console.log('   Crie um curso pago no admin primeiro.');
      return;
    }

    console.log(`✅ Curso encontrado: ${course.title}`);
    console.log(`   Preço: R$ ${course.price.toFixed(2)}`);
    console.log(`   ID: ${course.id}\n`);

    // 2. Buscar um aluno de teste
    console.log('2️⃣ Buscando aluno de teste...');
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

    console.log(`✅ Aluno: ${student.name} (${student.email})\n`);

    // 3. Verificar se já existe enrollment
    console.log('3️⃣ Verificando enrollment existente...');
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        courseId: course.id,
        studentId: student.id,
      },
    });

    let enrollment;
    if (existingEnrollment) {
      console.log(`⚠️  Enrollment já existe: ${existingEnrollment.id}`);
      console.log(`   Status: ${existingEnrollment.status}\n`);
      enrollment = existingEnrollment;
    } else {
      console.log('✅ Nenhum enrollment encontrado\n');

      // 4. Criar enrollment PENDING
      console.log('4️⃣ Criando enrollment PENDING...');
      enrollment = await prisma.enrollment.create({
        data: {
          courseId: course.id,
          studentId: student.id,
          status: 'PENDING',
        },
      });
      console.log(`✅ Enrollment criado: ${enrollment.id}\n`);
    }

    // 5. Criar payment PENDING (ou buscar existente)
    console.log('5️⃣ Gerenciando payment...');
    let payment = await prisma.payment.findUnique({
      where: { enrollmentId: enrollment.id },
    });

    if (payment) {
      console.log(`⚠️  Payment já existe: ${payment.id}`);
      console.log(`   Status: ${payment.status}\n`);
    } else {
      payment = await prisma.payment.create({
        data: {
          enrollmentId: enrollment.id,
          amount: course.price,
          currency: 'BRL',
          status: 'PENDING',
        },
      });
      console.log(`✅ Payment criado: ${payment.id}\n`);
    }

    // 6. Criar Stripe Checkout Session
    console.log('6️⃣ Criando Stripe Checkout Session...');
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'brl',
          product_data: {
            name: course.title,
            description: course.description,
          },
          unit_amount: Math.round(course.price * 100),
        },
        quantity: 1,
      }],
      customer_email: student.email,
      metadata: {
        enrollmentId: enrollment.id,
        courseId: course.id,
        studentId: student.id,
      },
      success_url: `${process.env.NEXT_PUBLIC_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/checkout/cancel?course_id=${course.id}`,
    });

    console.log(`✅ Checkout Session criada: ${checkoutSession.id}`);
    console.log(`   Status: ${checkoutSession.status}`);
    console.log(`   Valor: R$ ${(checkoutSession.amount_total / 100).toFixed(2)}\n`);

    // 7. Atualizar payment com sessionId
    console.log('7️⃣ Atualizando payment com sessionId...');
    await prisma.payment.update({
      where: { id: payment.id },
      data: { stripeSessionId: checkoutSession.id },
    });
    console.log('✅ Payment atualizado\n');

    // 8. Exibir URL de checkout
    console.log('🎉 CHECKOUT PRONTO!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 RESUMO:');
    console.log(`   Curso: ${course.title}`);
    console.log(`   Aluno: ${student.name}`);
    console.log(`   Valor: R$ ${course.price.toFixed(2)}`);
    console.log(`   Enrollment: ${enrollment.id}`);
    console.log(`   Payment: ${payment.id}`);
    console.log(`   Session: ${checkoutSession.id}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🔗 URL DE CHECKOUT (copie e cole no navegador):');
    console.log(checkoutSession.url);
    console.log('\n💳 CARTÕES DE TESTE:');
    console.log('   Sucesso: 4242 4242 4242 4242');
    console.log('   Recusado: 4000 0000 0000 0002');
    console.log('   Requer autenticação: 4000 0025 0000 3155');
    console.log('   Data: qualquer data futura (ex: 12/25)');
    console.log('   CVC: qualquer 3 dígitos (ex: 123)\n');

    console.log('⚠️  WEBHOOK:');
    console.log('   Configure o webhook no Stripe Dashboard para receber eventos:');
    console.log('   URL: http://localhost:3000/api/webhooks/stripe');
    console.log('   Eventos: checkout.session.completed, checkout.session.expired');
    console.log('   Dashboard: https://dashboard.stripe.com/test/webhooks\n');

    console.log('🧪 PARA TESTAR:');
    console.log('   1. Copie a URL de checkout acima');
    console.log('   2. Cole no navegador');
    console.log('   3. Use o cartão 4242 4242 4242 4242');
    console.log('   4. Complete o pagamento');
    console.log('   5. Verifique se o enrollment foi aprovado no banco\n');

  } catch (error) {
    console.error('❌ ERRO:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testCheckoutFlow();
