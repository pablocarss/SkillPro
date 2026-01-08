# Funcionalidades Detalhadas - SkillPro

Documentação completa de todas as funcionalidades implementadas na plataforma SkillPro.

## Índice

- [Autenticação e Autorização](#autenticação-e-autorização)
- [Gestão de Usuários](#gestão-de-usuários)
- [Sistema de Cursos](#sistema-de-cursos)
- [Sistema de Módulos e Aulas](#sistema-de-módulos-e-aulas)
- [Sistema de Avaliações](#sistema-de-avaliações)
- [Sistema de Certificados](#sistema-de-certificados)
- [Sistema de Inscrições](#sistema-de-inscrições)
- [Armazenamento de Arquivos](#armazenamento-de-arquivos)
- [Páginas e Rotas](#páginas-e-rotas)

---

## Autenticação e Autorização

### NextAuth.js Integration

**Tecnologia:** NextAuth.js v4 com Prisma Adapter

**Funcionalidades:**
- Login com credenciais (email/senha)
- Sessões seguras com JWT
- Proteção de rotas via middleware
- Refresh token automático

**Roles Disponíveis:**
- `ADMIN`: Acesso completo à plataforma
- `STUDENT`: Acesso ao catálogo e cursos inscritos

**Páginas Protegidas:**
- `/admin/*` - Apenas ADMIN
- `/dashboard/*` - ADMIN e STUDENT
- `/api/admin/*` - Apenas ADMIN

**Implementação:**
- **Arquivo:** `src/app/api/auth/[...nextauth]/route.ts`
- **Helpers:** `src/lib/auth-helpers.ts`
- **Middleware:** `middleware.ts`

---

## Gestão de Usuários

### Cadastro de Usuários

**Endpoint:** `POST /api/auth/signup`

**Campos:**
- Nome completo
- Email (único)
- CPF (opcional)
- Senha (hash com bcrypt)
- Role (padrão: STUDENT)

**Validações:**
- Email único
- Senha mínima: 6 caracteres
- CPF válido (formato brasileiro)

### Perfil do Usuário

**Funcionalidades:**
- Visualização de dados pessoais
- Edição de perfil
- Upload de foto (via MinIO)
- Histórico de cursos

**Páginas:**
- `/dashboard/profile` - Perfil do aluno
- `/admin/users` - Gestão de usuários (admin)

---

## Sistema de Cursos

### Criação de Cursos

**Página:** `/admin/courses/new`

**Campos:**
- Título
- Descrição
- Nível (BEGINNER, INTERMEDIATE, ADVANCED)
- Duração (ex: "20 horas")
- Categoria
- Template de certificado (opcional)
- Status de publicação

**Funcionalidades:**
- Criação de múltiplos módulos
- Associação de template de certificado
- Controle de publicação (isPublished)
- Preview do curso

### Gestão de Cursos

**Página:** `/admin/courses`

**Funcionalidades:**
- Listagem de todos os cursos
- Filtros por categoria/nível
- Edição de cursos existentes
- Exclusão de cursos
- Visualização de estatísticas:
  - Total de alunos inscritos
  - Taxa de conclusão
  - Certificados emitidos

### Visualização de Curso (Aluno)

**Página:** `/dashboard/courses/[courseId]`

**Funcionalidades:**
- Timeline de módulos e aulas
- Progresso visual (%)
- Acesso a aulas completadas
- Bloqueio de aulas não desbloqueadas
- Informações do curso

---

## Sistema de Módulos e Aulas

### Estrutura Hierárquica

```
Curso
  ├── Módulo 1
  │   ├── Aula 1.1 (vídeo)
  │   ├── Aula 1.2 (vídeo)
  │   └── Quiz do Módulo 1
  ├── Módulo 2
  │   ├── Aula 2.1 (vídeo)
  │   └── Quiz do Módulo 2
  └── Prova Final
```

### Criação de Módulos

**Funcionalidades:**
- Título e descrição
- Ordem dos módulos
- Associação ao curso

### Criação de Aulas

**Funcionalidades:**
- Título e descrição
- Upload de vídeo (MP4, WebM)
- Ordem das aulas no módulo
- Duração estimada

**Upload de Vídeos:**
- Tamanho máximo: 500MB
- Formatos aceitos: MP4, WebM, AVI
- Armazenamento: MinIO
- Streaming direto do MinIO

### Progresso do Aluno

**Rastreamento:**
- Aulas assistidas
- Percentual de conclusão por módulo
- Percentual de conclusão do curso
- Data de conclusão de cada aula

**Modelo:** `LessonProgress`
```prisma
model LessonProgress {
  id          String   @id @default(cuid())
  studentId   String
  lessonId    String
  completed   Boolean  @default(false)
  completedAt DateTime?
}
```

---

## Sistema de Avaliações

### Questionários (Quizzes)

**Tipos:**
- Quiz por módulo
- Prova final do curso

**Estrutura de Questão:**
```typescript
interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number; // índice da resposta correta
  points: number;
}
```

**Funcionalidades:**
- Múltipla escolha
- Pontuação configurável
- Feedback imediato
- Histórico de tentativas

### Prova Final

**Requisitos:**
- Nota mínima: 70% (configurável)
- Todas as aulas devem estar completadas
- Tentativas ilimitadas

**Modelo:** `FinalExam` e `StudentExamAttempt`

**Fluxo:**
1. Aluno completa todas as aulas
2. Acessa página da prova final
3. Responde questões
4. Sistema calcula nota
5. Se nota ≥ 70%: APROVADO
6. Certificado é gerado automaticamente

**Página:** `/dashboard/courses/[courseId]/final-exam`

---

## Sistema de Certificados

### Templates de Certificado

**Página:** `/admin/certificate-templates`

**Funcionalidades:**
- Upload de templates Word (.docx)
- Definição de template padrão
- Preview de variáveis
- Gestão de templates

**Variáveis Suportadas:**
- `{nome}` - Nome do aluno
- `{cpf}` - CPF do aluno
- `{curso}` - Título do curso
- `{carga_horaria}` - Duração do curso
- `{data}` - Data de conclusão
- `{nota}` - Nota final
- `{hash}` - Hash único do certificado

### Geração de Certificados

**Trigger:** Aprovação na prova final (nota ≥ 70%)

**Processo:**
1. Busca template (prioridade: Curso → Padrão)
2. Download do template (.docx) do MinIO
3. Processamento com docxtemplater (substitui variáveis)
4. Conversão DOCX → PDF com LibreOffice
5. Geração de hash único (SHA-256, 16 chars)
6. Geração de assinatura digital
7. Upload do PDF para MinIO
8. Criação de registro no banco

**Tecnologias:**
- **docxtemplater** - Processamento de templates
- **pizzip** - Manipulação de .docx
- **LibreOffice** - Conversão para PDF
- **SHA-256** - Hash e assinatura digital

**Arquivo:** `src/app/api/certificates/generate/route.ts`

### Visualização e Download

**Página do Aluno:** `/dashboard/certificates`

**Funcionalidades:**
- Listagem de certificados obtidos
- Visualização em PDF (nova aba)
- Download de PDF
- Informações do certificado:
  - Hash único
  - Data de emissão
  - Nota final
  - Link de verificação

**Headers do PDF:**
- `Content-Type: application/pdf`
- `Content-Disposition: inline`
  - Abre no navegador ao invés de baixar

### Verificação Pública

**Página:** `/verificar/[hash]`

**Funcionalidades:**
- Verificação por hash (16 caracteres)
- Validação de assinatura digital
- Exibição de dados do certificado:
  - Nome do aluno
  - CPF
  - Curso completado
  - Nota final
  - Data de conclusão
- Status visual (✅ Válido / ❌ Inválido)
- Download do PDF

**Acesso:** Público (sem necessidade de login)

---

## Sistema de Inscrições

### Catálogo de Cursos

**Página:** `/catalog`

**Funcionalidades:**
- Listagem de cursos publicados
- Filtros por categoria/nível
- Busca por título
- Cards com informações:
  - Título e descrição
  - Nível e duração
  - Número de aulas
  - Botão de inscrição

### Solicitação de Inscrição

**Endpoint:** `POST /api/enrollments`

**Fluxo:**
1. Aluno clica em "Solicitar Inscrição"
2. Sistema cria registro com status PENDING
3. Notificação para admin (futuro)
4. Aguarda aprovação

**Status Possíveis:**
- `PENDING` - Aguardando aprovação
- `APPROVED` - Aprovado, pode acessar curso
- `REJECTED` - Rejeitado pelo admin

### Aprovação de Inscrições

**Página:** `/admin/enrollments`

**Funcionalidades:**
- Listagem de solicitações pendentes
- Informações do aluno
- Aprovar inscrição
- Rejeitar inscrição
- Histórico de decisões

**Endpoint:** `PATCH /api/enrollments/[id]`

---

## Armazenamento de Arquivos

### MinIO (S3-Compatible Storage)

**Configuração:**
- Endpoint: `localhost:9000`
- Console: `localhost:9001`
- Bucket: `skillpro`

**Pastas:**
- `videos/` - Vídeos das aulas
- `certificates/` - PDFs dos certificados
- `certificate-templates/` - Templates Word
- `avatars/` - Fotos de perfil (futuro)

**Funcionalidades:**
- Upload de arquivos
- Download com URLs públicas
- Permissões públicas de leitura
- Compressão automática

**Biblioteca:** `src/lib/minio.ts`

**Funções:**
- `uploadVideo()` - Upload de vídeos
- `uploadFile()` - Upload genérico
- `deleteVideo()` - Exclusão de vídeos
- `deleteFile()` - Exclusão genérica

---

## Páginas e Rotas

### Páginas Públicas

| Rota | Descrição |
|------|-----------|
| `/` | Home page |
| `/login` | Login e cadastro |
| `/verificar/[hash]` | Verificação pública de certificados |

### Páginas do Aluno

| Rota | Descrição |
|------|-----------|
| `/dashboard` | Dashboard principal |
| `/dashboard/courses` | Meus cursos |
| `/dashboard/courses/[id]` | Visualização de curso |
| `/dashboard/courses/[id]/final-exam` | Prova final |
| `/dashboard/certificates` | Meus certificados |
| `/dashboard/profile` | Perfil do aluno |
| `/catalog` | Catálogo de cursos |

### Páginas Administrativas

| Rota | Descrição |
|------|-----------|
| `/admin` | Dashboard admin |
| `/admin/courses` | Gestão de cursos |
| `/admin/courses/new` | Criar novo curso |
| `/admin/courses/[id]` | Editar curso |
| `/admin/certificate-templates` | Gestão de templates |
| `/admin/enrollments` | Aprovar inscrições |
| `/admin/users` | Gestão de usuários |

### API Routes

#### Autenticação
- `POST /api/auth/signup` - Cadastro
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout

#### Cursos
- `GET /api/courses` - Listar cursos
- `POST /api/courses` - Criar curso
- `GET /api/courses/[id]` - Detalhes do curso
- `PATCH /api/courses/[id]` - Atualizar curso
- `DELETE /api/courses/[id]` - Excluir curso

#### Módulos
- `POST /api/courses/[id]/modules` - Criar módulo
- `PATCH /api/modules/[id]` - Atualizar módulo
- `DELETE /api/modules/[id]` - Excluir módulo

#### Aulas
- `POST /api/modules/[id]/lessons` - Criar aula
- `PATCH /api/lessons/[id]` - Atualizar aula
- `DELETE /api/lessons/[id]` - Excluir aula
- `POST /api/lessons/[id]/complete` - Marcar como completa

#### Inscrições
- `GET /api/enrollments` - Listar inscrições
- `POST /api/enrollments` - Solicitar inscrição
- `PATCH /api/enrollments/[id]` - Aprovar/Rejeitar

#### Certificados
- `POST /api/certificates/generate` - Gerar certificado
- `GET /api/certificates/[id]` - Detalhes do certificado

#### Templates
- `GET /api/admin/certificate-templates` - Listar templates
- `POST /api/admin/certificate-templates` - Criar template
- `DELETE /api/admin/certificate-templates/[id]` - Excluir

---

## Integrações e Bibliotecas

### Principais Dependências

```json
{
  "next": "15.1.0",
  "react": "^19.0.0",
  "prisma": "^6.1.0",
  "@prisma/client": "^6.1.0",
  "next-auth": "^4.24.11",
  "bcrypt": "^5.1.1",
  "minio": "^8.0.2",
  "docxtemplater": "^3.56.0",
  "pizzip": "^3.1.7",
  "@radix-ui/react-*": "^1.1.2",
  "tailwindcss": "^3.4.1",
  "typescript": "^5.8.0"
}
```

### Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Linter
npx prisma generate  # Gerar Prisma Client
npx prisma migrate dev  # Criar migração
npx prisma studio    # Interface visual do BD
```

---

## Performance e Otimizações

### Caching
- Next.js automaticamente cacheia páginas estáticas
- ISR (Incremental Static Regeneration) para catálogo
- Cache de sessões no servidor

### Lazy Loading
- Componentes carregados sob demanda
- Vídeos com loading progressivo
- Imagens otimizadas com next/image

### Database
- Índices em campos frequentemente consultados
- Queries otimizadas com Prisma
- Paginação em listagens grandes

---

## Segurança

### Autenticação
- Senhas com bcrypt (salt rounds: 10)
- Tokens JWT com expiração
- CSRF protection via NextAuth

### Autorização
- Middleware para proteção de rotas
- Verificação de role em cada endpoint
- Sessões server-side

### Uploads
- Validação de tipo de arquivo
- Limite de tamanho
- Sanitização de nomes de arquivo

### Certificados
- Hash SHA-256 único
- Assinatura digital verificável
- Impossível falsificar

---

## Funcionalidades Futuras (Roadmap)

- [ ] Notificações em tempo real (WebSocket)
- [ ] Gamificação (badges, pontos, ranking)
- [ ] Fórum de discussão por curso
- [ ] Chat ao vivo com instrutor
- [ ] Sistema de recomendação de cursos
- [ ] Analytics avançado para admin
- [ ] API pública para integrações
- [ ] App mobile (React Native)
- [ ] Suporte a múltiplos idiomas
- [ ] Pagamentos integrados (Stripe)

---

**Última atualização:** 30 de dezembro de 2025
