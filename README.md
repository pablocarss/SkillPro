# SkillPro - Plataforma de Educação Online

Plataforma completa de e-learning desenvolvida com Next.js 15, oferecendo uma experiência moderna e intuitiva para cursos online com sistema de certificação digital e módulo empresarial completo.

## Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades Principais](#funcionalidades-principais)
- [Módulo Empresarial](#módulo-empresarial)
- [Sistema de Relatórios](#sistema-de-relatórios)
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

- **Para Administradores**: Criar e gerenciar cursos, módulos, aulas, questionários, provas finais, treinamentos empresariais e visualizar relatórios detalhados
- **Para Empresas**: Gerenciar funcionários, atribuir treinamentos corporativos, acompanhar progresso e personalizar certificados
- **Para Alunos**: Navegar por catálogo de cursos, assistir videoaulas, fazer avaliações e obter certificados digitais
- **Para Funcionários**: Realizar treinamentos corporativos, fazer quizzes e provas, obter certificados empresariais
- **Para Todos**: Sistema robusto de autenticação, verificação pública de certificados e gestão de perfis

## Funcionalidades Principais

### Landing Page Moderna
- Hero section com gradientes animados e design profissional
- Seção de estatísticas em tempo real (alunos, cursos, certificados)
- Catálogo de cursos em destaque
- Seção empresarial para treinamentos corporativos
- Verificação pública de certificados
- Design responsivo e otimizado para SEO

### Sistema de Registro e Autenticação
- Cadastro completo de alunos com dados necessários para certificação
- Campos: nome, email, CPF, data de nascimento, telefone
- Validação e formatação automática de CPF e telefone
- NextAuth.js com Prisma Adapter
- Roles: ADMIN, STUDENT e EMPLOYEE
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
- **Player protegido** com controles customizados
- Detecção automática do tipo de vídeo
- **Auto-marcação de aula como concluída** ao finalizar vídeo
- Interface responsiva e moderna

### Sistema de Avaliações
- **Quizzes por aula** (opcional)
- **Prova final** do curso/treinamento
- Nota mínima configurável (padrão: 70%)
- Múltiplas tentativas permitidas
- Correção automática
- Feedback imediato

### Sistema de Certificados
- Templates personalizados em Word (.docx)
- Conversão automática para PDF com LibreOffice
- **Variáveis dinâmicas disponíveis:**
  - Dados do aluno: `{nome}`, `{cpf}`, `{email}`
  - Dados do curso: `{curso}`, `{treinamento}`, `{descricao}`, `{carga_horaria}`, `{nivel}`
  - Datas: `{data}`, `{data_curta}`, `{dia}`, `{mes}`, `{ano}`
  - Desempenho: `{nota}`, `{nota_inteiro}`
  - Empresa: `{empresa}`, `{cnpj}`, `{empresa_funcionario}`, `{cnpj_funcionario}`
  - Verificação: `{hash}`, `{url_verificacao}`
- Hash único de 16 caracteres (SHA-256)
- Assinatura digital para validação
- **Verificação pública** de certificados de cursos e treinamentos
- Download/visualização em PDF

### Sistema de Inscrições Híbrido
- **Cursos Gratuitos**: Solicitação de inscrição → Aprovação manual do admin
- **Cursos Pagos**: Checkout → Aprovação automática após pagamento
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
- **Vinculação de múltiplas empresas** ao mesmo treinamento
- Estrutura modular: Treinamento → Módulos → Aulas
- **Upload de vídeos** com player protegido
- **Materiais de apoio** por aula
- **Quizzes por aula** (opcional)
- **Prova final** com nota mínima configurável
- Atribuição de treinamentos a funcionários
- Controle de prazos e obrigatoriedade
- Acompanhamento de progresso em tempo real

### Certificados Empresariais
- **Templates personalizados por empresa**
- Documentação de variáveis disponíveis no upload
- Certificados com dados da empresa
- **Validação pública** de certificados (`/verificar/[hash]`)
- Suporte a certificados de cursos EAD e treinamentos

### Painel Administrativo Empresarial
- `/admin/empresarial/empresas` - Gestão de empresas
- `/admin/empresarial/funcionarios` - Gestão de funcionários
- `/admin/empresarial/treinamentos` - Gestão de treinamentos
- `/admin/empresarial/treinamentos/[id]/prova-final` - Configuração de prova final

### Portal do Funcionário
- `/treinamentos` - Lista de treinamentos atribuídos
- `/treinamentos/[id]` - Conteúdo do treinamento com progresso
- `/treinamentos/[id]/prova` - Realização da prova final
- `/treinamentos/certificados` - Certificados obtidos

## Sistema de Relatórios

O painel administrativo inclui relatórios detalhados em `/admin/relatorios`:

### Estatísticas Gerais
- Total de usuários, alunos, funcionários
- Total de empresas, cursos e treinamentos

### Relatórios de Cursos EAD
- Total de matrículas e taxa de conclusão
- Progresso detalhado por aluno
- Última aula acessada
- Data da última atividade
- **Alunos parados** (sem atividade há +7 dias)

### Relatórios de Treinamentos
- Total de matrículas e conclusões por empresa
- Progresso detalhado por funcionário
- Agrupamento por empresa
- **Funcionários parados** (sem atividade há +7 dias)

### Exportação
- **Exportação para CSV** de cursos e treinamentos
- Dados completos de progresso e status

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
- **Zod** - Validação de schemas

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

# Certificados
CERTIFICATE_SECRET="sua-chave-secreta-certificados"
```

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
2. **Visualizar Relatórios**:
   - Acesse `/admin/relatorios`
   - Veja estatísticas de cursos e treinamentos
   - Identifique alunos/funcionários parados
   - Exporte dados para CSV
3. **Criar Template de Certificado**:
   - Acesse `/admin/certificate-templates`
   - Faça upload de um arquivo Word (.docx)
   - Use variáveis: `{nome}`, `{cpf}`, `{curso}`, etc.
4. **Criar Curso**:
   - Acesse `/admin/courses`
   - Preencha informações do curso
   - Escolha o tipo: Gratuito ou Pago
   - Se pago, defina o preço em R$
   - Selecione template de certificado
   - Crie módulos e aulas
   - Faça upload de vídeos ou use URLs externas
   - Adicione materiais de apoio às aulas
   - Configure questionários e prova final
5. **Gerenciar Cupons**:
   - Acesse `/admin/coupons`
   - Crie cupons com código, tipo de desconto e validade
6. **Gerenciar Inscrições**:
   - Acesse `/admin/enrollments`
   - Aprove ou rejeite solicitações de cursos gratuitos

### Gestão Empresarial (Admin)

1. **Cadastrar Empresas**:
   - Acesse `/admin/empresarial/empresas`
   - Adicione informações da empresa parceira
2. **Cadastrar Funcionários**:
   - Acesse `/admin/empresarial/funcionarios`
   - Cadastre individualmente ou importe via planilha
3. **Criar Treinamentos**:
   - Acesse `/admin/empresarial/treinamentos`
   - Crie treinamentos e vincule empresas
   - Adicione módulos e aulas com vídeos
   - Configure materiais de apoio
   - Configure quizzes por aula (opcional)
   - Configure prova final em "Prova Final"
   - Faça upload de templates de certificado por empresa
   - Atribua funcionários

### Como Aluno

1. **Cadastro** em `/login` (aba "Criar Conta")
2. **Explorar Cursos** na landing page ou em `/dashboard/catalog`
3. **Inscrever-se em Curso**:
   - **Curso Gratuito**: Clique em "Inscrever-se Grátis"
   - **Curso Pago**: Clique em "Comprar Agora" → Aplicar cupom (opcional) → Pagar
4. **Estudar** em `/dashboard/courses`:
   - Assistir aulas em sequência
   - Baixar materiais de apoio
   - Completar questionários
   - Fazer prova final (nota mínima: 70%)
5. **Baixar Certificado** em `/dashboard/certificates`

### Como Funcionário (Empresarial)

1. **Acesse** `/treinamentos` com suas credenciais
2. **Visualize** os treinamentos atribuídos pela empresa
3. **Complete** as aulas com vídeos e materiais
4. **Responda** os quizzes de cada aula
5. **Faça** a prova final em `/treinamentos/[id]/prova`
6. **Baixe** seus certificados em `/treinamentos/certificados`

### Verificação Pública de Certificado

Qualquer pessoa pode verificar um certificado (curso EAD ou treinamento) em:
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
│   │   │   ├── relatorios/   # Relatórios e estatísticas
│   │   │   └── empresarial/  # Módulo empresarial
│   │   │       ├── empresas/
│   │   │       ├── funcionarios/
│   │   │       └── treinamentos/
│   │   │           └── [id]/prova-final/
│   │   ├── api/              # API Routes
│   │   │   ├── admin/        # APIs administrativas
│   │   │   │   ├── reports/  # API de relatórios
│   │   │   │   ├── coupons/
│   │   │   │   ├── empresas/
│   │   │   │   ├── funcionarios/
│   │   │   │   └── treinamentos/
│   │   │   ├── training-exams/     # Submissão de provas
│   │   │   ├── training-quizzes/   # Quizzes de treinamentos
│   │   │   ├── training-lessons/   # Aulas e materiais
│   │   │   ├── treinamentos/       # APIs de treinamentos
│   │   │   │   └── [id]/final-exam/
│   │   │   └── video/stream/       # Streaming de vídeo
│   │   │       └── training/       # Vídeos de treinamentos
│   │   ├── checkout/         # Páginas de checkout
│   │   ├── cursos/           # Detalhes públicos de cursos
│   │   ├── dashboard/        # Dashboard do aluno
│   │   ├── empresarial/      # Landing empresarial
│   │   ├── login/            # Autenticação
│   │   ├── treinamentos/     # Portal do funcionário
│   │   │   ├── [id]/prova/   # Prova final
│   │   │   └── certificados/ # Certificados
│   │   ├── page.tsx          # Landing page
│   │   └── verificar/        # Verificação de certificados
│   ├── components/           # Componentes React
│   │   ├── landing/          # Componentes da landing page
│   │   ├── ui/               # Componentes UI (Radix)
│   │   ├── training-video-player.tsx    # Player protegido
│   │   ├── training-lesson-quiz.tsx     # Quiz de aula
│   │   ├── training-material-upload.tsx # Upload de materiais
│   │   └── ...
│   └── lib/                  # Bibliotecas e utilitários
│       ├── training-certificate-generator.ts # Certificados de treinamentos
│       ├── certificate-generator.ts          # Certificados de cursos
│       ├── validations.ts    # Validações Zod
│       ├── abacatepay.ts     # Cliente AbacatePay
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
