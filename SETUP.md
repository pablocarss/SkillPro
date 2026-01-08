# Guia de Configuração - SkillPro

Este guia vai te ajudar a configurar e executar o projeto SkillPro do zero.

## Pré-requisitos

Certifique-se de ter instalado:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Docker** e **Docker Compose** ([Download](https://www.docker.com/))
- **Git** ([Download](https://git-scm.com/))

## Passo 1: Clone o Repositório (se aplicável)

```bash
git clone <seu-repositorio>
cd SkillPro
```

## Passo 2: Instalar Dependências

```bash
npm install
```

Este comando instalará todas as dependências necessárias do projeto.

## Passo 3: Configurar Variáveis de Ambiente

1. Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

2. Edite o arquivo `.env` e configure a chave secreta do NextAuth:

```bash
# Gerar uma chave secreta aleatória
openssl rand -base64 32
```

3. Cole a chave gerada no arquivo `.env`:

```env
NEXTAUTH_SECRET="sua-chave-gerada-aqui"
```

O arquivo `.env` deve ficar assim:

```env
# Database
DATABASE_URL="postgresql://skillpro:skillpro@localhost:5432/skillpro?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-gerada-aqui"  # IMPORTANTE: Substitua isso!
```

## Passo 4: Iniciar o Banco de Dados

Inicie o PostgreSQL usando Docker:

```bash
docker-compose up -d
```

Aguarde alguns segundos para o PostgreSQL inicializar completamente.

## Passo 5: Configurar o Banco de Dados

Execute as migrations do Prisma:

```bash
npm run db:push
```

## Passo 6: Popular o Banco com Dados Iniciais

Execute o seed para criar usuários de exemplo e curso demo:

```bash
npm run db:seed
```

Isso criará:
- **Admin**: admin@skillpro.com / admin123
- **Aluno**: student@skillpro.com / student123
- Um curso de demonstração

## Passo 7: Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

O servidor iniciará em: http://localhost:3000

## Testando a Aplicação

### Como Administrador

1. Acesse: http://localhost:3000/login
2. Faça login com:
   - Email: `admin@skillpro.com`
   - Senha: `admin123`
3. Você será redirecionado para `/admin`
4. Experimente:
   - Criar novos cursos
   - Adicionar aulas aos cursos
   - Criar quizzes para as aulas
   - Configurar prova final
   - Aprovar inscrições de alunos
   - Gerenciar alunos e outros admins

### Como Aluno

1. Acesse: http://localhost:3000/login
2. Faça login com:
   - Email: `student@skillpro.com`
   - Senha: `student123`
3. Você será redirecionado para `/dashboard`
4. Experimente:
   - Visualizar cursos disponíveis
   - Acessar o curso demo
   - Assistir aulas
   - Fazer quizzes
   - Fazer a prova final
   - Visualizar certificados

## Estrutura do Projeto

```
SkillPro/
├── prisma/
│   ├── schema.prisma      # Schema do banco de dados
│   └── seed.ts            # Dados iniciais
├── src/
│   ├── app/               # Rotas do Next.js
│   │   ├── admin/         # Páginas do admin
│   │   ├── dashboard/     # Páginas do aluno
│   │   ├── api/           # API routes
│   │   └── login/         # Página de login
│   ├── components/        # Componentes React
│   │   └── ui/            # Componentes shadcn/ui
│   ├── lib/               # Utilitários e configurações
│   └── types/             # Definições de tipos TypeScript
├── docs/                  # Documentação
├── docker-compose.yml     # Configuração Docker
└── package.json           # Dependências do projeto
```

## Funcionalidades Principais

### Para Administradores

✅ **Gerenciar Cursos**
- Criar, editar e publicar cursos
- Definir nível, duração e % de aprovação

✅ **Gerenciar Aulas**
- Criar timeline de aulas
- Adicionar conteúdo e vídeos
- Organizar ordem das aulas

✅ **Gerenciar Quizzes**
- Criar quizzes por aula
- Adicionar questões de múltipla escolha
- Definir nota mínima de aprovação

✅ **Prova Final**
- Configurar prova final do curso
- Define geração automática de certificado

✅ **Gerenciar Usuários**
- Criar alunos e administradores
- Aprovar/rejeitar inscrições em cursos

### Para Alunos

✅ **Estudar Cursos**
- Visualizar cursos disponíveis
- Seguir timeline de aulas
- Assistir vídeos e ler conteúdo

✅ **Fazer Avaliações**
- Realizar quizzes por aula
- Fazer prova final do curso
- Visualizar notas e progresso

✅ **Certificados**
- Receber certificado automático ao passar na prova final
- Visualizar todos os certificados obtidos

## Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Build
npm run build        # Cria build de produção
npm run start        # Inicia servidor de produção

# Banco de Dados
npm run db:push      # Sincroniza schema Prisma
npm run db:migrate   # Cria nova migration
npm run db:studio    # Abre Prisma Studio (GUI)
npm run db:seed      # Popula banco com dados

# Outros
npm run lint         # Executa linter
```

## Ferramentas Úteis

### Prisma Studio

Visualize e edite dados do banco com interface gráfica:

```bash
npm run db:studio
```

Acesse: http://localhost:5555

### Docker Compose

```bash
# Ver logs do PostgreSQL
docker-compose logs postgres

# Parar containers
docker-compose down

# Resetar tudo (cuidado: deleta dados)
docker-compose down -v
```

## Problemas Comuns

### Erro: "Port 5432 already in use"

Você já tem PostgreSQL rodando. Pare o serviço ou mude a porta no `docker-compose.yml`.

### Erro: "Invalid `prisma.user.findUnique()`"

Execute novamente:
```bash
npm run db:push
```

### Erro: "NEXTAUTH_SECRET must be provided"

Certifique-se de configurar o `.env` corretamente (Passo 3).

### Erro ao fazer login

Verifique se executou o seed:
```bash
npm run db:seed
```

## Próximos Passos

Depois de testar a aplicação, você pode:

1. **Explorar a documentação**
   - Leia `docs/INTEGRATIONS.md` para entender como integrar MinIO e Redis

2. **Personalizar o sistema**
   - Modifique cores no `tailwind.config.ts`
   - Customize o schema do banco em `prisma/schema.prisma`

3. **Adicionar funcionalidades**
   - Implementar upload de vídeos com MinIO
   - Adicionar cache com Redis
   - Criar geração de PDF para certificados

4. **Deploy para produção**
   - Configure variáveis de ambiente de produção
   - Use serviços como Vercel (Next.js) + Railway (PostgreSQL)
   - Configure domínio e SSL

## Suporte

Se encontrar problemas:

1. Verifique os logs: `docker-compose logs`
2. Confirme que todas as dependências foram instaladas
3. Certifique-se de que as portas 3000 e 5432 estão livres
4. Tente resetar o banco: `docker-compose down -v && docker-compose up -d`

## Tecnologias Utilizadas

- **Framework**: Next.js 15 + React 19 + TypeScript
- **Banco de Dados**: PostgreSQL + Prisma ORM
- **Autenticação**: NextAuth.js
- **UI Components**: shadcn/ui + Radix UI + Tailwind CSS
- **Ícones**: Lucide Icons
- **Containerização**: Docker

## Licença

MIT

---

Desenvolvido com ❤️ para a comunidade EAD
