# SkillPro - Plataforma de Educação Online

Plataforma completa de e-learning desenvolvida com Next.js 15, oferecendo uma experiência moderna e intuitiva para cursos online com sistema de certificação digital e módulo empresarial.

## Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades Principais](#funcionalidades-principais)
- [Módulo Empresarial](#módulo-empresarial)
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

- **Para Administradores**: Criar e gerenciar cursos, módulos, aulas, questionários, provas finais e treinamentos empresariais
- **Para Empresas**: Gerenciar funcionários, atribuir treinamentos corporativos e acompanhar progresso
- **Para Alunos**: Navegar por catálogo de cursos, assistir videoaulas, fazer avaliações e obter certificados digitais
- **Para Todos**: Sistema robusto de autenticação, verificação pública de certificados e gestão de perfis

## Funcionalidades Principais

### Landing Page Moderna
- Hero section com gradientes animados e design profissional
- Seção de estatísticas em tempo real (alunos, cursos, certificados)
- Prévia de 6 cursos em destaque
- Seção empresarial para treinamentos corporativos
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

### Sistema de Pagamentos (AbacatePay)
- **Cursos Gratuitos**: Inscrição com aprovação do admin
- **Cursos Pagos**: Checkout integrado com AbacatePay
- **PIX Instantâneo**: Pagamento com aprovação imediata
- **Cartão de Crédito**: Visa, Mastercard, Elo
- **Cupons de Desconto**: Sistema completo de cupons promocionais
- Webhook para confirmação automática de pagamentos
- Aprovação automática após pagamento confirmado
- Ambiente de teste e produção

### Sistema de Cupons de Desconto
- Criação de cupons com código personalizado
- Tipos de desconto: **percentual (%)** ou **valor fixo (R$)**
- **Aplicável a todos os cursos ou cursos específicos**
- Seleção múltipla de cursos por cupom
- Data de validade configurável (início e fim)
- Limite de usos por cupom
- Valor mínimo de compra
- Validação em tempo real no checkout
- Histórico de uso de cupons
- Toggle de ativação/desativação rápida

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
- **Suporte a vídeos externos** (YouTube, Vimeo, Google Drive)
- Organização hierárquica: Curso → Módulos → Aulas
- Controle de progresso do aluno
- Thumbnails e imagens de capa

### Sistema de Materiais de Apoio
- Upload de materiais por aula (PDF, DOC, XLS, etc.)
- Download de materiais pelos alunos
- Organização por tipo de arquivo
- Gerenciamento completo no painel admin

### Player de Vídeo Avançado
- Player nativo para vídeos hospedados
- **Player externo** para YouTube, Vimeo e Google Drive
- Detecção automática do tipo de vídeo
- Interface responsiva e moderna

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
- **Geração de certificados para treinamentos empresariais**

### Sistema de Inscrições Híbrido
- **Cursos Gratuitos**: Solicitação de inscrição → Aprovação manual do admin
- **Cursos Pagos**: Checkout Stripe → Aprovação automática após pagamento
- Status de matrícula (PENDING, APPROVED, REJECTED)
- Rastreamento de pagamentos e transações
- Dashboard do aluno com separação: "Meus Cursos" vs "Todos os Cursos"

## Módulo Empresarial

O SkillPro oferece um módulo completo para treinamentos corporativos:

### Gestão de Empresas
- Cadastro de empresas parceiras
- Informações completas (CNPJ, contato, endereço)
- Dashboard com métricas por empresa
- Controle de contratos e planos

### Gestão de Funcionários
- Cadastro individual de funcionários
- **Importação em massa via planilha Excel/CSV**
- Vinculação automática à empresa
- Geração de credenciais de acesso
- Template de importação para download

### Treinamentos Corporativos
- Criação de treinamentos específicos por empresa
- Estrutura modular: Treinamento → Módulos → Aulas
- Atribuição de treinamentos a funcionários
- Controle de prazos e obrigatoriedade
- Acompanhamento de progresso em tempo real

### Certificados Empresariais
- Templates personalizados por empresa
- Certificados com logo da empresa
- Validação pública de certificados
- Relatórios de conclusão

### Painel Administrativo Empresarial
- `/admin/empresarial/empresas` - Gestão de empresas
- `/admin/empresarial/funcionarios` - Gestão de funcionários
- `/admin/empresarial/treinamentos` - Gestão de treinamentos

### Portal do Funcionário
- `/treinamentos` - Lista de treinamentos atribuídos
- `/treinamentos/[id]` - Conteúdo do treinamento
- `/treinamentos/certificados` - Certificados obtidos

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
- **AbacatePay** - Gateway de pagamentos brasileiro
- **PIX** - Pagamento instantâneo
- **Cartão de Crédito** - Visa, Mastercard, Elo
- **Webhooks** - Confirmação automática de pagamentos

### Segurança
- **SHA-256** - Hash de certificados e assinaturas digitais
- **crypto** (Node.js) - Criptografia nativa
- **bcrypt** - Hash seguro de senhas
- **Webhook Signatures** - Validação de eventos de pagamento

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

# AbacatePay (Pagamentos)
ABACATEPAY_API_KEY="abc_dev_..."
ABACATEPAY_WEBHOOK_SECRET="webh_dev_..."
ABACATEPAY_DEV_MODE="true"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> **Nota:** Para obter suas chaves do AbacatePay:
> 1. Crie uma conta em [abacatepay.com](https://abacatepay.com)
> 2. Acesse o Dashboard para obter as chaves de API
> 3. Configure o webhook no Dashboard:
>    - URL: `https://seu-dominio.com/api/webhooks/abacatepay?webhookSecret=SEU_SECRET`
>    - Eventos: `billing.paid`
> 4. Para desenvolvimento local, use ngrok para expor sua URL

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
   - Faça upload de vídeos ou use URLs externas (YouTube, Vimeo)
   - Adicione materiais de apoio às aulas
   - Configure questionários e prova final
4. **Gerenciar Cupons**:
   - Acesse `/admin/coupons`
   - Crie cupons com código, tipo de desconto e validade
5. **Gerenciar Inscrições**:
   - Acesse `/admin/enrollments`
   - Aprove ou rejeite solicitações de **cursos gratuitos**
   - Cursos pagos são aprovados automaticamente após pagamento

### Gestão Empresarial (Admin)

1. **Cadastrar Empresas**:
   - Acesse `/admin/empresarial/empresas`
   - Adicione informações da empresa parceira
2. **Cadastrar Funcionários**:
   - Acesse `/admin/empresarial/funcionarios`
   - Cadastre individualmente ou importe via planilha
   - Baixe o template de importação
3. **Criar Treinamentos**:
   - Acesse `/admin/empresarial/treinamentos`
   - Crie treinamentos específicos para empresas
   - Adicione módulos e aulas
   - Atribua a funcionários

### Como Aluno

1. **Cadastro** em `/login` (aba "Criar Conta"):
   - Preencha: nome, email, CPF, data de nascimento, telefone, senha
   - Dados são necessários para geração do certificado
2. **Explorar Cursos** na landing page ou em `/dashboard/catalog`
3. **Inscrever-se em Curso**:
   - **Curso Gratuito**: Clique em "Inscrever-se Grátis" → Aguardar aprovação do admin
   - **Curso Pago**: Clique em "Comprar Agora" → Aplicar cupom (opcional) → Pagar via Stripe → Aprovação automática
4. **Estudar** em `/dashboard/courses`:
   - Acessar "Meus Cursos" (cursos aprovados)
   - Assistir aulas em sequência
   - Baixar materiais de apoio
   - Completar questionários
   - Fazer prova final (nota mínima: 70%)
5. **Baixar Certificado** em `/dashboard/certificates`

### Como Funcionário (Empresarial)

1. **Acesse** `/treinamentos` com suas credenciais
2. **Visualize** os treinamentos atribuídos pela empresa
3. **Complete** as aulas e avaliações
4. **Baixe** seus certificados em `/treinamentos/certificados`

### Testando Pagamentos (Ambiente de Desenvolvimento)

O AbacatePay oferece modo de desenvolvimento para testes:

1. Configure `ABACATEPAY_DEV_MODE="true"` no `.env`
2. Use ngrok para expor sua URL local:
   ```bash
   docker-compose up -d  # Inclui ngrok
   ```
3. Configure a URL do ngrok no `.env`:
   ```
   NEXT_PUBLIC_APP_URL="https://seu-tunnel.ngrok-free.dev"
   ```
4. Configure o webhook no dashboard do AbacatePay

**Métodos de pagamento disponíveis:**
- **PIX**: Aprovação instantânea via QR Code
- **Cartão de Crédito**: Visa, Mastercard, Elo

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
│   │   │   ├── courses/      # Gestão de cursos
│   │   │   ├── coupons/      # Gestão de cupons
│   │   │   └── empresarial/  # Módulo empresarial
│   │   │       ├── empresas/
│   │   │       ├── funcionarios/
│   │   │       └── treinamentos/
│   │   ├── api/              # API Routes
│   │   │   ├── admin/        # APIs administrativas
│   │   │   │   ├── coupons/  # CRUD de cupons
│   │   │   │   ├── empresas/ # CRUD de empresas
│   │   │   │   ├── funcionarios/ # CRUD de funcionários
│   │   │   │   └── treinamentos/ # CRUD de treinamentos
│   │   │   ├── auth/         # Autenticação
│   │   │   ├── coupons/      # Validação de cupons
│   │   │   ├── courses/      # APIs de cursos
│   │   │   │   └── [courseId]/materials/ # Materiais do curso
│   │   │   ├── lessons/      # APIs de aulas
│   │   │   │   └── [lessonId]/materials/ # Materiais da aula
│   │   │   ├── payments/     # APIs de pagamento (AbacatePay)
│   │   │   ├── treinamentos/ # APIs de treinamentos
│   │   │   ├── upload/       # Upload de arquivos
│   │   │   ├── video/        # Streaming de vídeo
│   │   │   └── webhooks/     # Webhooks (AbacatePay)
│   │   ├── checkout/         # Páginas de checkout
│   │   ├── cursos/           # Detalhes públicos de cursos
│   │   ├── dashboard/        # Dashboard do aluno
│   │   ├── empresarial/      # Landing empresarial
│   │   ├── login/            # Autenticação
│   │   ├── treinamentos/     # Portal do funcionário
│   │   ├── page.tsx          # Landing page
│   │   └── verificar/        # Verificação de certificados
│   ├── components/           # Componentes React
│   │   ├── landing/          # Componentes da landing page
│   │   │   └── enterprise-section.tsx # Seção empresarial
│   │   ├── ui/               # Componentes UI (Radix)
│   │   │   ├── alert.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── table.tsx
│   │   │   └── textarea.tsx
│   │   ├── course-card.tsx   # Card de curso
│   │   ├── employee-import-dialog.tsx # Importação de funcionários
│   │   ├── external-video-player.tsx  # Player externo
│   │   ├── generate-certificate-button.tsx # Botão de certificado
│   │   ├── material-upload.tsx # Upload de materiais
│   │   └── video-player.tsx  # Player de vídeo
│   └── lib/                  # Bibliotecas e utilitários
│       ├── abacatepay.ts     # Cliente AbacatePay
│       ├── certificate-generator.ts # Gerador de certificados
│       ├── video-utils.ts    # Utilitários de vídeo
│       ├── docx-to-pdf.ts    # Conversão DOCX→PDF
│       ├── minio.ts          # Cliente MinIO
│       └── prisma.ts         # Cliente Prisma
├── scripts/                  # Scripts utilitários
├── docs/                     # Documentação
├── docker-compose.yml        # Docker Compose config
├── .env.example              # Exemplo de variáveis
├── package.json
└── README.md
```

## Documentação Adicional

- [Funcionalidades Detalhadas](./docs/FUNCIONALIDADES.md)
- [Regras de Negócio](./docs/REGRAS_DE_NEGOCIOS.md)
- [Sistema de Certificados](./docs/SISTEMA_CERTIFICADOS_FINAL.md)
- [Guia de Testes de Certificados](./docs/TESTE_CERTIFICADOS.md)
- [Guia de Testes de Pagamento](./TESTE-FLUXO-COMPRA.md)

## Scripts de Teste

O projeto inclui scripts prontos para testar funcionalidades:

```bash
# Criar aluno de teste limpo (sem inscrições)
node create-test-student.js

# Popular banco com dados de teste
npx tsx scripts/seed.ts
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
