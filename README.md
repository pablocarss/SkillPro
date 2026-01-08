# SkillPro - Plataforma de Educação Online

Plataforma completa de e-learning desenvolvida com Next.js 15, oferecendo uma experiência moderna e intuitiva para cursos online com sistema de certificação digital.

## Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades Principais](#funcionalidades-principais)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Documentação Adicional](#documentação-adicional)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

## Sobre o Projeto

SkillPro é uma plataforma de ensino online completa que permite:

- **Para Administradores**: Criar e gerenciar cursos, módulos, aulas, questionários e provas finais
- **Para Alunos**: Navegar por catálogo de cursos, assistir videoaulas, fazer avaliações e obter certificados digitais
- **Para Todos**: Sistema robusto de autenticação, verificação pública de certificados e gestão de perfis

## Funcionalidades Principais

### Landing Page Moderna
- Hero section com gradientes animados e design profissional
- Seção de estatísticas em tempo real (alunos, cursos, certificados)
- Prévia de 6 cursos em destaque
- Depoimentos de alunos aprovados
- Design responsivo e otimizado para SEO

### Sistema de Registro e Autenticação
- Cadastro completo de alunos com dados necessários para certificação
- Campos: nome, email, CPF, data de nascimento, telefone
- Validação e formatação automática de CPF e telefone
- NextAuth.js com Prisma Adapter
- Roles: ADMIN e STUDENT
- Páginas protegidas por middleware
- Sessões seguras

### Sistema de Pagamentos (Stripe)
- **Cursos Gratuitos**: Inscrição com aprovação do admin
- **Cursos Pagos**: Checkout integrado com Stripe
- Processamento seguro de pagamentos com cartão de crédito
- Webhook para confirmação automática de pagamentos
- Aprovação automática após pagamento confirmado
- Páginas de sucesso e cancelamento personalizadas
- Ambiente de teste completo com cartões de teste

### Catálogo Público de Cursos
- Listagem completa de cursos disponíveis
- Filtros visuais: cursos pagos vs gratuitos
- Cards com informações detalhadas (preço, nível, duração, alunos)
- Página individual de detalhes do curso
- Visualização do currículo (módulos e aulas)
- Informações do instrutor
- CTA (Call-to-Action) inteligente baseado no tipo de curso

### Sistema de Cursos
- Criação de cursos gratuitos ou pagos
- Configuração de preços em reais (BRL)
- Upload de vídeos para aulas via MinIO (S3-compatible)
- Organização hierárquica: Curso → Módulos → Aulas
- Controle de progresso do aluno
- Thumbnails e imagens de capa

### Sistema de Avaliações
- Questionários por módulo
- Prova final do curso
- Nota mínima configurável (padrão: 70%)
- Múltiplas tentativas permitidas

### Sistema de Certificados
- Templates personalizados em Word (.docx)
- Conversão automática para PDF com LibreOffice
- Variáveis dinâmicas: `{nome}`, `{cpf}`, `{curso}`, `{carga_horaria}`, `{data}`, `{nota}`, `{hash}`
- Hash único de 16 caracteres (SHA-256)
- Assinatura digital para validação
- Página pública de verificação
- Download/visualização em PDF

### Sistema de Inscrições Híbrido
- **Cursos Gratuitos**: Solicitação de inscrição → Aprovação manual do admin
- **Cursos Pagos**: Checkout Stripe → Aprovação automática após pagamento
- Status de matrícula (PENDING, APPROVED, REJECTED)
- Rastreamento de pagamentos e transações
- Dashboard do aluno com separação: "Meus Cursos" vs "Todos os Cursos"

## Tecnologias Utilizadas

### Frontend
- **Next.js 15.1.0** - Framework React com App Router
- **React 19** - Biblioteca de interfaces
- **TypeScript** - Superset tipado do JavaScript
- **Tailwind CSS** - Framework CSS utilitário
- **Radix UI** - Componentes acessíveis e customizáveis
- **Lucide React** - Biblioteca de ícones

### Backend
- **Next.js API Routes** - Endpoints RESTful
- **Prisma ORM** - Object-Relational Mapping
- **PostgreSQL** - Banco de dados relacional
- **NextAuth.js** - Autenticação completa
- **bcrypt** - Hash de senhas

### Armazenamento e Processamento
- **MinIO** - Object storage S3-compatible
- **Docker** - Containerização (PostgreSQL e MinIO)
- **LibreOffice** - Conversão DOCX para PDF
- **docxtemplater** - Processamento de templates Word
- **pizzip** - Manipulação de arquivos .docx

### Pagamentos
- **Stripe** - Gateway de pagamentos internacional
- **Stripe Checkout** - Interface de pagamento hospedada
- **Webhooks** - Confirmação automática de pagamentos

### Segurança
- **SHA-256** - Hash de certificados e assinaturas digitais
- **crypto** (Node.js) - Criptografia nativa
- **bcrypt** - Hash seguro de senhas
- **Stripe Webhook Signatures** - Validação de eventos do Stripe

## Pré-requisitos

- Node.js 18+ e npm
- Docker e Docker Compose
- LibreOffice (para conversão de certificados)
- Git

## Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/pablocarss/SkillPro.git
cd SkillPro
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações.

### 4. Inicie os containers Docker

```bash
docker-compose up -d
```

Isso irá iniciar:
- PostgreSQL na porta 5432
- MinIO na porta 9000 (API) e 9001 (Console)

### 5. Execute as migrações do banco de dados

```bash
npx prisma migrate dev
npx prisma generate
```

### 6. Configure o MinIO

```bash
node scripts/init-minio.js
```

### 7. (Opcional) Popule o banco com dados de teste

```bash
npx tsx scripts/seed.ts
```

### 8. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

## Configuração

### Variáveis de Ambiente

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/skillpro"

# NextAuth
NEXTAUTH_SECRET="sua-chave-secreta-aqui"
NEXTAUTH_URL="http://localhost:3000"

# MinIO
MINIO_ENDPOINT="localhost"
MINIO_PORT="9000"
MINIO_ACCESS_KEY="skillpro"
MINIO_SECRET_KEY="skillpro123"
MINIO_BUCKET="skillpro"

# Stripe (Pagamentos)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_URL="http://localhost:3000"
```

> **Nota:** Para obter suas chaves do Stripe:
> 1. Crie uma conta em [stripe.com](https://stripe.com)
> 2. Acesse [Dashboard → API Keys](https://dashboard.stripe.com/test/apikeys)
> 3. Configure o webhook em [Dashboard → Webhooks](https://dashboard.stripe.com/test/webhooks)
>    - URL: `http://localhost:3000/api/webhooks/stripe`
>    - Eventos: `checkout.session.completed`, `checkout.session.expired`

### MinIO Console

Acesse: [http://localhost:9001](http://localhost:9001)

```
Usuário: skillpro
Senha: skillpro123
```

### Contas Padrão

**Admin:**
```
Email: admin@skillpro.com
Senha: admin123
```

**Aluno:**
```
Email: student@skillpro.com
Senha: student123
```

## Uso

### Como Administrador

1. **Login** em `/login` com credenciais de admin
2. **Criar Template de Certificado**:
   - Acesse `/admin/certificate-templates`
   - Faça upload de um arquivo Word (.docx)
   - Use variáveis: `{nome}`, `{cpf}`, `{curso}`, etc.
3. **Criar Curso**:
   - Acesse `/admin/courses`
   - Preencha informações do curso
   - **Escolha o tipo**: Gratuito ou Pago
   - Se pago, defina o preço em R$
   - Selecione template de certificado
   - Crie módulos e aulas
   - Faça upload de vídeos
   - Configure questionários e prova final
4. **Gerenciar Inscrições**:
   - Acesse `/admin/enrollments`
   - Aprove ou rejeite solicitações de **cursos gratuitos**
   - Cursos pagos são aprovados automaticamente após pagamento

### Como Aluno

1. **Cadastro** em `/login` (aba "Criar Conta"):
   - Preencha: nome, email, CPF, data de nascimento, telefone, senha
   - Dados são necessários para geração do certificado
2. **Explorar Cursos** na landing page ou em `/dashboard/catalog`
3. **Inscrever-se em Curso**:
   - **Curso Gratuito**: Clique em "Inscrever-se Grátis" → Aguardar aprovação do admin
   - **Curso Pago**: Clique em "Comprar Agora" → Pagar via Stripe → Aprovação automática
4. **Estudar** em `/dashboard/courses`:
   - Acessar "Meus Cursos" (cursos aprovados)
   - Assistir aulas em sequência
   - Completar questionários
   - Fazer prova final (nota mínima: 70%)
5. **Baixar Certificado** em `/dashboard/certificates`

### Testando Pagamentos (Ambiente de Desenvolvimento)

Use os cartões de teste do Stripe:

```
Cartão de Sucesso:
Número: 4242 4242 4242 4242
Data: Qualquer data futura (ex: 12/25)
CVC: Qualquer 3 dígitos (ex: 123)

Cartão Recusado:
Número: 4000 0000 0000 0002

Cartão que Requer Autenticação:
Número: 4000 0025 0000 3155
```

Para testes completos, execute:
```bash
node test-stripe.js           # Testar conexão com Stripe
node test-checkout-flow.js    # Testar fluxo completo de checkout
node create-test-student.js   # Criar aluno de teste limpo
```

Veja o guia completo em: [TESTE-FLUXO-COMPRA.md](./TESTE-FLUXO-COMPRA.md)

### Verificação Pública de Certificado

Qualquer pessoa pode verificar um certificado em:
```
/verificar/[HASH]
```

## Estrutura do Projeto

```
SkillPro/
├── prisma/
│   ├── schema.prisma          # Schema do banco de dados
│   └── migrations/            # Migrações do Prisma
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── admin/            # Páginas administrativas
│   │   ├── api/              # API Routes
│   │   │   ├── auth/        # Autenticação (registro)
│   │   │   ├── create-checkout-session/ # Checkout Stripe
│   │   │   └── webhooks/    # Webhooks (Stripe)
│   │   ├── checkout/         # Páginas de checkout
│   │   ├── cursos/           # Detalhes públicos de cursos
│   │   ├── dashboard/        # Dashboard do aluno
│   │   │   ├── catalog/     # Catálogo (todos os cursos)
│   │   │   └── courses/     # Meus cursos (aprovados)
│   │   ├── login/            # Autenticação
│   │   ├── page.tsx          # Landing page modernizada
│   │   └── verificar/        # Verificação de certificados
│   ├── components/           # Componentes React
│   │   ├── landing/         # Componentes da landing page
│   │   ├── ui/              # Componentes UI (Radix)
│   │   ├── course-card.tsx  # Card de curso reutilizável
│   │   ├── enroll-button.tsx # Botão de inscrição inteligente
│   │   └── register-form.tsx # Formulário de registro
│   └── lib/                 # Bibliotecas e utilitários
│       ├── auth-helpers.ts  # Helpers de autenticação
│       ├── docx-to-pdf.ts   # Conversão DOCX→PDF
│       ├── minio.ts         # Cliente MinIO
│       ├── pdf-converter.ts # Geração de PDF
│       └── prisma.ts        # Cliente Prisma
├── scripts/                 # Scripts utilitários
│   ├── init-minio.js       # Inicializar MinIO
│   ├── seed.ts             # Popular banco de dados
│   └── generate-certificate-direct.ts
├── docs/                    # Documentação
│   ├── FUNCIONALIDADES.md
│   ├── REGRAS_DE_NEGOCIOS.md
│   └── *.md
├── test-stripe.js          # Teste de integração Stripe
├── test-checkout-flow.js   # Teste de fluxo de checkout
├── create-test-student.js  # Criar aluno de teste
├── verify-purchase-flow.js # Verificar fluxo de compra
├── TESTE-FLUXO-COMPRA.md   # Guia de testes de pagamento
├── docker-compose.yml       # Docker Compose config
├── .env.example            # Exemplo de variáveis
├── package.json
└── README.md
```

## Documentação Adicional

- [Funcionalidades Detalhadas](./docs/FUNCIONALIDADES.md)
- [Regras de Negócio](./docs/REGRAS_DE_NEGOCIOS.md)
- [Sistema de Certificados](./docs/SISTEMA_CERTIFICADOS_FINAL.md)
- [Guia de Testes de Certificados](./docs/TESTE_CERTIFICADOS.md)
- **[Guia de Testes de Pagamento](./TESTE-FLUXO-COMPRA.md)** ⭐ Novo!

## Scripts de Teste

O projeto inclui scripts prontos para testar todas as funcionalidades:

```bash
# Testar conexão com Stripe
node test-stripe.js

# Testar fluxo completo de checkout
node test-checkout-flow.js

# Criar aluno de teste limpo (sem inscrições)
node create-test-student.js

# Verificar estado do fluxo de compra
node verify-purchase-flow.js
```

## Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

Desenvolvido com dedicação por [pablocarss](https://github.com/pablocarss)
