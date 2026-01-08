require('dotenv').config();
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function testStripe() {
  console.log('🔍 Testando integração com Stripe...\n');

  try {
    // 1. Testar conexão com Stripe
    console.log('1️⃣ Testando autenticação...');
    const balance = await stripe.balance.retrieve();
    console.log('✅ Conectado ao Stripe com sucesso!');
    console.log(`   Moeda: ${balance.available[0]?.currency || 'N/A'}\n`);

    // 2. Criar um produto de teste
    console.log('2️⃣ Criando produto de teste...');
    const product = await stripe.products.create({
      name: 'Curso de Teste - JavaScript Avançado',
      description: 'Curso completo de JavaScript para testar integração',
    });
    console.log(`✅ Produto criado: ${product.id}\n`);

    // 3. Criar um preço para o produto
    console.log('3️⃣ Criando preço de teste...');
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: 19990, // R$ 199.90 em centavos
      currency: 'brl',
    });
    console.log(`✅ Preço criado: ${price.id} - R$ 199.90\n`);

    // 4. Criar uma sessão de checkout de teste
    console.log('4️⃣ Criando sessão de checkout de teste...');
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price: price.id,
        quantity: 1,
      }],
      customer_email: 'teste@skillpro.com',
      metadata: {
        courseId: 'test-course-id',
        studentId: 'test-student-id',
      },
      success_url: 'http://localhost:3000/checkout/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:3000/checkout/cancel',
    });
    console.log(`✅ Sessão de checkout criada: ${session.id}`);
    console.log(`   URL: ${session.url}\n`);

    // 5. Verificar webhook endpoint (se configurado)
    console.log('5️⃣ Verificando webhooks...');
    try {
      const webhooks = await stripe.webhookEndpoints.list({ limit: 5 });
      if (webhooks.data.length > 0) {
        console.log(`✅ Encontrados ${webhooks.data.length} webhook(s):`);
        webhooks.data.forEach((webhook, index) => {
          console.log(`   ${index + 1}. ${webhook.url}`);
          console.log(`      Status: ${webhook.status}`);
          console.log(`      Eventos: ${webhook.enabled_events.join(', ')}`);
        });
      } else {
        console.log('⚠️  Nenhum webhook configurado ainda');
        console.log('   Configure em: https://dashboard.stripe.com/test/webhooks');
        console.log('   Endpoint: http://localhost:3000/api/webhooks/stripe');
        console.log('   Eventos necessários: checkout.session.completed, checkout.session.expired');
      }
    } catch (err) {
      console.log('⚠️  Não foi possível verificar webhooks:', err.message);
    }

    console.log('\n✅ TODOS OS TESTES PASSARAM COM SUCESSO!\n');
    console.log('📋 Próximos passos:');
    console.log('   1. Acesse o dashboard: https://dashboard.stripe.com/test/payments');
    console.log('   2. Configure webhook em: https://dashboard.stripe.com/test/webhooks');
    console.log('   3. Use cartão de teste: 4242 4242 4242 4242');
    console.log('   4. Data: qualquer data futura');
    console.log('   5. CVC: qualquer 3 dígitos\n');

    // Limpar produtos de teste
    console.log('🧹 Limpando produtos de teste...');
    await stripe.products.del(product.id);
    console.log('✅ Limpeza concluída\n');

  } catch (error) {
    console.error('❌ ERRO:', error.message);
    if (error.type === 'StripeAuthenticationError') {
      console.error('\n⚠️  Erro de autenticação! Verifique se a STRIPE_SECRET_KEY está correta no .env');
    }
    process.exit(1);
  }
}

testStripe();
