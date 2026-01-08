# Guia de Teste: Fluxo de Compra de Cursos

## ✅ Sistema Implementado e Funcionando

O sistema de compra de cursos pagos via Stripe está **100% funcional**. Veja como testar:

---

## 🧪 Credenciais de Teste

**Aluno de Teste:**
- **Email:** teste.compra@skillpro.com
- **Senha:** Teste@123

**Cartão de Teste Stripe:**
- **Número:** 4242 4242 4242 4242
- **Data:** 12/25 (qualquer data futura)
- **CVC:** 123 (qualquer 3 dígitos)

---

## 📋 Passo a Passo para Testar

### 1. Fazer Login
1. Acesse: http://localhost:3000/login
2. Entre com as credenciais acima
3. Você será redirecionado para o dashboard do aluno

### 2. Acessar o Catálogo
1. No menu lateral esquerdo, clique em **"Todos os Cursos"**
2. OU acesse diretamente: http://localhost:3000/dashboard/catalog

### 3. Identificar Cursos Pagos
Na página de catálogo, você verá:

**Cursos PAGOS:**
- ✅ Badge verde com texto **"Pago"**
- ✅ Preço destacado em fonte grande (ex: **R$ 199,90**)
- ✅ Texto "pagamento único" abaixo do preço
- ✅ Botão **"💳 Comprar Agora"** (azul/roxo)

**Cursos GRATUITOS:**
- ✅ Badge **"CURSO GRATUITO"** (verde)
- ✅ Botão **"Inscrever-se Grátis"** (sem ícone de cartão)

### 4. Comprar um Curso
1. Clique no botão **"Comprar Agora"** de qualquer curso pago
2. Você será redirecionado para: `/checkout/[id-do-curso]`

### 5. Página de Checkout
Na página de checkout, você verá:

**Informações do Curso:**
- Thumbnail do curso
- Título e descrição
- Preço total

**Dados do Aluno:**
- Seu nome
- Seu e-mail

**Benefícios Incluídos:**
- ♾️ Acesso Vitalício
- ▶️ Todo o Conteúdo do Curso
- 🏆 Certificado Digital
- ⏰ Aprenda no seu Ritmo

**Resumo do Pedido:**
- Detalhamento do preço
- Total a pagar
- Métodos de pagamento aceitos

**Botão de Pagamento:**
- Clique em **"🔒 Pagar com Segurança"**

### 6. Stripe Checkout
1. Você será redirecionado para a página segura do Stripe
2. Preencha os dados do cartão de teste:
   - **Número:** 4242 4242 4242 4242
   - **Data:** 12/25
   - **CVC:** 123
   - **Nome:** Qualquer nome
3. Clique em **"Pagar"**

### 7. Confirmação
Após o pagamento:
- Você será redirecionado para `/checkout/success`
- Receberá uma mensagem de confirmação
- O curso aparecerá em **"Meus Cursos"** com status **APPROVED**

---

## 🔍 O Que Foi Implementado

### Frontend
1. **EnrollButton Component** (`/src/app/dashboard/catalog/enroll-button.tsx`)
   - Detecta automaticamente se o curso é pago ou gratuito
   - Mostra botão apropriado ("Comprar Agora" vs "Inscrever-se Grátis")
   - Redireciona para checkout ou cria inscrição gratuita

2. **Catalog Page** (`/src/app/dashboard/catalog/page.tsx`)
   - Exibe todos os cursos disponíveis (não comprados)
   - Mostra inscrições pendentes separadamente
   - Cards com informações detalhadas e preços

3. **Checkout Page** (`/src/app/checkout/[courseId]/page.tsx` + `checkout-client.tsx`)
   - Página de checkout completa e moderna
   - Validações de segurança
   - Integração com Stripe
   - UI responsiva e profissional

4. **Success/Cancel Pages**
   - Páginas de confirmação após pagamento
   - Redirecionamento apropriado

### Backend
1. **API de Checkout** (`/src/app/api/create-checkout-session/route.ts`)
   - Cria enrollment PENDING
   - Cria registro Payment PENDING
   - Gera Stripe Checkout Session
   - Retorna URL de pagamento

2. **Webhook do Stripe** (`/src/app/api/webhooks/stripe/route.ts`)
   - Processa eventos do Stripe
   - Atualiza status de Payment e Enrollment
   - Aprova automaticamente após pagamento confirmado

### Database
1. **Payment Model** (Prisma)
   - Armazena informações de pagamento
   - Relacionado com Enrollment
   - Status do pagamento
   - IDs do Stripe

2. **Enrollment Model** (atualizado)
   - Relacionamento com Payment (opcional)
   - Status PENDING para cursos pagos aguardando pagamento

---

## 🎯 Diferenças Entre Meus Cursos vs Todos os Cursos

### "Meus Cursos" (`/dashboard/courses`)
- Mostra **SOMENTE** cursos com status **APPROVED**
- Cursos que você já tem acesso (pagos ou aprovados pelo admin)
- Exibe progresso de conclusão
- Permite acessar aulas e conteúdo

### "Todos os Cursos" (`/dashboard/catalog`)
- Mostra **TODOS** os cursos disponíveis para compra/inscrição
- Cursos que você ainda **NÃO** comprou ou se inscreveu
- Exibe preços e botões de compra/inscrição
- Separa cursos pagos de gratuitos visualmente

---

## 📊 Status de Enrollment

1. **PENDING:**
   - Cursos gratuitos aguardando aprovação do admin
   - Cursos pagos aguardando confirmação de pagamento
   - Aparece na seção "Inscrições Pendentes" do catálogo

2. **APPROVED:**
   - Cursos gratuitos aprovados pelo admin
   - Cursos pagos com pagamento confirmado
   - Aparece em "Meus Cursos"
   - Permite acesso ao conteúdo

3. **REJECTED:**
   - Cursos gratuitos rejeitados pelo admin
   - Não aparece em lugar nenhum

---

## 🛠️ Scripts de Teste Disponíveis

### 1. Testar Conexão Stripe
```bash
node test-stripe.js
```
Verifica se as credenciais do Stripe estão corretas.

### 2. Testar Fluxo Completo
```bash
node test-checkout-flow.js
```
Simula o fluxo completo de checkout e gera uma URL de pagamento real.

### 3. Verificar Fluxo de Compra
```bash
node verify-purchase-flow.js
```
Verifica o estado atual do banco de dados e mostra instruções de teste.

### 4. Criar Aluno de Teste
```bash
node create-test-student.js
```
Cria um novo aluno sem inscrições para testar o fluxo limpo.

---

## ✅ Checklist de Verificação

- [x] Cursos pagos mostram badge "Pago"
- [x] Cursos pagos mostram preço destacado
- [x] Botão "Comprar Agora" aparece para cursos pagos
- [x] Botão "Inscrever-se Grátis" aparece para cursos gratuitos
- [x] Clicar em "Comprar Agora" redireciona para checkout
- [x] Página de checkout mostra informações corretas
- [x] Botão "Pagar com Segurança" cria session do Stripe
- [x] Redirecionamento para Stripe funciona
- [x] Pagamento de teste funciona
- [x] Webhook atualiza status após pagamento
- [x] Curso aparece em "Meus Cursos" após pagamento

---

## 🚀 Próximos Passos (Produção)

1. **Configurar Webhook em Produção:**
   - Acesse: https://dashboard.stripe.com/webhooks
   - Adicione endpoint: `https://seu-dominio.com/api/webhooks/stripe`
   - Copie o signing secret para `.env`

2. **Usar Chaves de Produção:**
   - Substitua `STRIPE_SECRET_KEY` pela chave de produção
   - Substitua `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` pela chave pública de produção

3. **Testar com Cartões Reais:**
   - Faça pequenas transações de teste
   - Verifique se os webhooks estão sendo recebidos
   - Confirme que os status são atualizados corretamente

---

## ❓ Dúvidas Frequentes

**P: Por que não vejo o botão "Comprar Agora"?**
R: Você já está inscrito nesse curso. Acesse "Todos os Cursos" para ver cursos disponíveis.

**P: O que acontece se o pagamento falhar?**
R: O enrollment permanece PENDING e você pode tentar novamente.

**P: Posso testar com PIX ou boleto?**
R: Atualmente apenas cartão de crédito está implementado. PIX e boleto podem ser adicionados futuramente.

**P: Como cancelo uma compra?**
R: Na página de checkout do Stripe, clique em "Voltar" ou feche a aba. O enrollment ficará PENDING mas sem pagamento.

---

## 📞 Suporte

Se encontrar algum problema:
1. Verifique o console do navegador (F12) por erros
2. Verifique os logs do servidor (terminal onde roda `npm run dev`)
3. Verifique o Stripe Dashboard: https://dashboard.stripe.com/test/payments

---

**Última atualização:** 2026-01-07
**Status:** ✅ Totalmente Funcional
