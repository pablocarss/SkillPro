# Regras de Negócio - SkillPro

Este documento define as regras de negócio implementadas na plataforma SkillPro, garantindo consistência e integridade dos processos.

## Índice

- [Gestão de Usuários](#gestão-de-usuários)
- [Gestão de Cursos](#gestão-de-cursos)
- [Inscrições e Matrículas](#inscrições-e-matrículas)
- [Progresso do Aluno](#progresso-do-aluno)
- [Sistema de Avaliações](#sistema-de-avaliações)
- [Sistema de Certificados](#sistema-de-certificados)
- [Permissões e Acessos](#permissões-e-acessos)

---

## Gestão de Usuários

### RN001 - Cadastro de Usuário

**Regra:** Todo usuário deve fornecer email e senha únicos para se cadastrar.

**Validações:**
- Email deve ser único no sistema
- Email deve ter formato válido (regex)
- Senha deve ter no mínimo 6 caracteres
- Nome completo é obrigatório
- CPF é opcional, mas se fornecido deve ser válido

**Comportamento:**
- Novos usuários têm role `STUDENT` por padrão
- Apenas admin pode criar usuários com role `ADMIN`
- Senha é hasheada com bcrypt antes de ser armazenada
- Email é armazenado em lowercase

**Exceções:**
- Retorna erro 400 se email já existe
- Retorna erro 400 se validações falharem

### RN002 - Autenticação

**Regra:** Apenas usuários cadastrados podem fazer login.

**Validações:**
- Email deve existir no sistema
- Senha deve corresponder ao hash armazenado
- Conta não pode estar desativada (futuro)

**Comportamento:**
- Login bem-sucedido cria sessão JWT
- Sessão expira em 30 dias (configurável)
- Logout invalida sessão atual

### RN003 - Alteração de Perfil

**Regra:** Usuários podem editar apenas seus próprios dados.

**Validações:**
- Apenas o próprio usuário pode editar seu perfil
- Admin pode editar qualquer perfil
- Não é possível alterar o próprio role
- Email alterado deve continuar único

---

## Gestão de Cursos

### RN004 - Criação de Curso

**Regra:** Apenas administradores podem criar cursos.

**Validações:**
- Título é obrigatório e único
- Nível deve ser: BEGINNER, INTERMEDIATE ou ADVANCED
- Duração deve ser string (ex: "20 horas")
- Curso deve ter pelo menos 1 módulo

**Comportamento:**
- Cursos são criados com `isPublished: true` por padrão
- Apenas cursos publicados aparecem no catálogo
- Template de certificado é opcional
- Se não especificado, usa template padrão

### RN005 - Publicação de Curso

**Regra:** Curso só aparece no catálogo se `isPublished = true`.

**Validações:**
- Admin pode publicar/despublicar a qualquer momento
- Despublicar curso não afeta alunos já inscritos

**Comportamento:**
- Cursos não publicados são visíveis apenas no admin
- Alunos não podem se inscrever em cursos não publicados

### RN006 - Exclusão de Curso

**Regra:** Curso só pode ser excluído se não tiver alunos inscritos.

**Validações:**
- Verifica se existem matrículas ativas
- Verifica se existem certificados emitidos

**Comportamento:**
- Se tiver alunos: retorna erro 400
- Se não tiver alunos: soft delete (marca como excluído)
- Exclusão em cascata: módulos, aulas, quizzes

---

## Inscrições e Matrículas

### RN007 - Solicitação de Inscrição

**Regra:** Aluno pode solicitar inscrição em cursos publicados.

**Validações:**
- Curso deve estar publicado (`isPublished = true`)
- Aluno não pode ter inscrição existente no mesmo curso
- Aluno deve estar autenticado

**Comportamento:**
- Inscrição criada com status `PENDING`
- Aguarda aprovação do administrador
- Aluno não pode acessar curso enquanto PENDING

**Exceções:**
- Retorna erro 400 se já inscrito
- Retorna erro 404 se curso não existe

### RN008 - Aprovação de Inscrição

**Regra:** Apenas administrador pode aprovar/rejeitar inscrições.

**Validações:**
- Inscrição deve existir
- Status deve ser `PENDING`
- Apenas admin pode alterar status

**Comportamento:**
- `APPROVED`: Aluno ganha acesso ao curso
- `REJECTED`: Aluno não pode acessar, pode solicitar novamente
- Notificação ao aluno (futuro)

### RN009 - Cancelamento de Inscrição

**Regra:** Aluno pode cancelar inscrição a qualquer momento.

**Validações:**
- Inscrição deve pertencer ao aluno
- Não pode cancelar se já obteve certificado

**Comportamento:**
- Progresso é mantido no banco
- Pode se inscrever novamente depois
- Certificado (se existir) permanece válido

---

## Progresso do Aluno

### RN010 - Acesso Sequencial às Aulas

**Regra:** Aluno deve completar aulas em ordem sequencial.

**Validações:**
- Primeira aula do curso está sempre disponível
- Próxima aula só é desbloqueada após completar a anterior
- Ordem é definida pelo campo `order` em Lesson

**Comportamento:**
- Aulas futuras aparecem bloqueadas na UI
- Clicar em aula bloqueada mostra mensagem de aviso
- Completar aula desbloqueia próxima automaticamente

### RN011 - Completar Aula

**Regra:** Aluno marca aula como completa ao assistir o vídeo.

**Validações:**
- Aluno deve estar inscrito no curso
- Inscrição deve estar APPROVED
- Aula deve estar desbloqueada

**Comportamento:**
- Cria/atualiza registro em `LessonProgress`
- Define `completed = true` e `completedAt = now()`
- Recalcula percentual de progresso do curso
- Desbloqueia próxima aula

### RN012 - Cálculo de Progresso

**Regra:** Progresso é calculado automaticamente.

**Fórmula:**
```
Progresso (%) = (Aulas Completadas / Total de Aulas) × 100
```

**Comportamento:**
- Atualizado a cada aula completada
- Exibido visualmente com barra de progresso
- 100% = Todas as aulas completadas

---

## Sistema de Avaliações

### RN013 - Questionários por Módulo

**Regra:** Cada módulo pode ter um questionário opcional.

**Validações:**
- Aluno deve ter completado todas as aulas do módulo
- Cada questão tem 4 opções de resposta
- Apenas uma resposta correta por questão

**Comportamento:**
- Nota calculada: (Acertos / Total) × 100
- Pode fazer múltiplas tentativas
- Salva melhor nota
- Questionário não bloqueia progresso (opcional)

### RN014 - Prova Final

**Regra:** Aluno só pode fazer prova final após completar 100% das aulas.

**Validações:**
- Todas as aulas do curso devem estar completas
- Inscrição deve estar APPROVED
- Prova deve ter pelo menos 3 questões

**Comportamento:**
- Aluno pode fazer múltiplas tentativas
- Cada tentativa é salva no banco
- Nota mínima de aprovação: 70%
- Aprovação (≥70%) gera certificado automaticamente

**Exceções:**
- Retorna erro 400 se aulas não completadas
- Retorna erro 404 se prova não existe

### RN015 - Nota de Aprovação

**Regra:** Nota mínima para aprovação é 70%.

**Validações:**
- Nota calculada: (Acertos / Total) × 100
- Arredondamento: 1 casa decimal

**Comportamento:**
- Nota ≥ 70%: Status `PASSED`, gera certificado
- Nota < 70%: Status `FAILED`, pode tentar novamente
- Melhor nota é considerada para certificado

---

## Sistema de Certificados

### RN016 - Geração Automática

**Regra:** Certificado é gerado automaticamente ao passar na prova final.

**Trigger:**
- Aluno conclui prova final
- Nota ≥ 70%

**Validações:**
- Certificado não pode ser duplicado
- Unique constraint: `studentId + courseId`

**Comportamento:**
- Busca template (prioridade: Curso → Padrão)
- Processa template Word com dados do aluno
- Converte para PDF via LibreOffice
- Gera hash único (SHA-256, 16 chars)
- Gera assinatura digital
- Upload PDF para MinIO
- Cria registro no banco

### RN017 - Hash Único

**Regra:** Cada certificado tem hash único de 16 caracteres.

**Geração:**
```typescript
SHA256(studentId + courseId + timestamp)
  .substring(0, 16)
  .toUpperCase()
```

**Validações:**
- Hash deve ser único
- Formato: Hexadecimal maiúsculo
- Tamanho: Exatamente 16 caracteres

**Comportamento:**
- Usado para verificação pública
- URL: `/verificar/[HASH]`

### RN018 - Assinatura Digital

**Regra:** Certificados têm assinatura digital para validação.

**Geração:**
```typescript
HMAC-SHA256(
  hash + studentId + courseId + finalScore,
  CERTIFICATE_SECRET
)
```

**Validações:**
- Secret key deve estar em variável de ambiente
- Assinatura não pode ser alterada
- Verificação na página pública

**Comportamento:**
- Garante integridade do certificado
- Impede falsificação
- Validação automática em `/verificar/[hash]`

### RN019 - Templates de Certificado

**Regra:** Admin pode criar múltiplos templates.

**Validações:**
- Arquivo deve ser .docx válido
- Tamanho máximo: 10MB
- Pode ter apenas 1 template padrão

**Comportamento:**
- Definir template como padrão remove flag dos outros
- Template padrão é usado se curso não especificar
- Variáveis são substituídas automaticamente:
  - `{nome}` → Nome do aluno
  - `{cpf}` → CPF do aluno
  - `{curso}` → Título do curso
  - `{carga_horaria}` → Duração do curso
  - `{data}` → Data de conclusão (pt-BR)
  - `{nota}` → Nota final (1 decimal)
  - `{hash}` → Hash do certificado

### RN020 - Exclusão de Template

**Regra:** Template só pode ser excluído se não estiver em uso.

**Validações:**
- Não pode excluir se houver:
  - Cursos usando o template
  - Certificados gerados com o template

**Comportamento:**
- Se em uso: retorna erro 400
- Se não usado: deleta do MinIO e do banco

### RN021 - Verificação Pública

**Regra:** Qualquer pessoa pode verificar autenticidade de certificado.

**Validações:**
- Hash deve ter 16 caracteres
- Certificado deve existir no banco
- Assinatura deve ser válida

**Comportamento:**
- Página pública: `/verificar/[hash]`
- Não requer autenticação
- Mostra:
  - Status de validação (✅/❌)
  - Dados do aluno (nome, CPF)
  - Dados do curso
  - Nota final
  - Data de conclusão
  - Link para download do PDF

---

## Permissões e Acessos

### RN022 - Controle de Acesso por Role

**Regra:** Páginas e ações são restritas por role.

**ADMIN:**
- ✅ Acessar `/admin/*`
- ✅ Criar/editar/excluir cursos
- ✅ Criar/editar/excluir templates
- ✅ Aprovar/rejeitar inscrições
- ✅ Visualizar todos os usuários
- ✅ Gerar certificados manualmente

**STUDENT:**
- ✅ Acessar `/dashboard/*`
- ✅ Visualizar catálogo
- ✅ Solicitar inscrições
- ✅ Assistir aulas (se inscrito e aprovado)
- ✅ Fazer provas
- ✅ Baixar certificados próprios
- ❌ Acessar `/admin/*`

**Público (sem autenticação):**
- ✅ Acessar `/`
- ✅ Acessar `/login`
- ✅ Acessar `/verificar/[hash]`
- ❌ Acessar qualquer outra página

### RN023 - Middleware de Proteção

**Regra:** Middleware valida acesso a todas as rotas protegidas.

**Validações:**
- Verifica se usuário está autenticado
- Verifica se role é adequado para a rota
- Redireciona se não autorizado

**Comportamento:**
- Sem autenticação → Redireciona para `/login`
- Role insuficiente → Retorna 403 Forbidden
- Token expirado → Redireciona para `/login`

### RN024 - API Endpoints Protegidos

**Regra:** Todos os endpoints de API validam autorização.

**Validações:**
- Header de autenticação obrigatório
- Session token válido
- Role apropriado para a ação

**Comportamento:**
- Usa `requireAuth()` helper
- Retorna 401 se não autenticado
- Retorna 403 se role insuficiente
- Retorna dados apenas se autorizado

---

## Regras de Integridade

### RN025 - Exclusão em Cascata

**Regra:** Exclusão de entidades pai remove entidades filhas.

**Cascatas:**
- Curso excluído:
  - ✅ Exclui módulos
  - ✅ Exclui aulas
  - ✅ Exclui quizzes
  - ✅ Exclui prova final
  - ❌ NÃO exclui matrículas (soft delete)

- Módulo excluído:
  - ✅ Exclui aulas
  - ✅ Exclui quiz do módulo

- Usuário excluído:
  - ❌ NÃO exclui (soft delete recomendado)
  - Mantém histórico de certificados

### RN026 - Validação de Dados

**Regra:** Todos os dados são validados antes de persistir.

**Validações Comuns:**
- Strings: não vazias, tamanho máximo
- Emails: formato válido, únicos
- Números: valores positivos, ranges válidos
- Datas: formato ISO, não futuras (quando aplicável)
- Arquivos: tipo MIME correto, tamanho máximo

**Comportamento:**
- Validação no client-side (UX)
- Validação no server-side (segurança)
- Retorna mensagens de erro claras

### RN027 - Transações Atômicas

**Regra:** Operações críticas usam transações do banco.

**Operações Transacionais:**
- Geração de certificado (template + PDF + registro)
- Criação de curso com módulos
- Aprovação de inscrição

**Comportamento:**
- Tudo sucede ou tudo falha
- Rollback automático em caso de erro
- Garante consistência de dados

---

## Regras de Negócio Futuras

### RN100 - Sistema de Pontuação

- Aluno ganha pontos por:
  - Completar aulas
  - Acertar quizzes
  - Obter certificados
- Ranking de alunos por pontos
- Badges por conquistas

### RN101 - Pré-requisitos de Cursos

- Curso pode exigir outro curso completado
- Validação antes de inscrição
- Caminho de aprendizagem recomendado

### RN102 - Validade de Certificado

- Certificados podem ter data de expiração
- Renovação obrigatória após período
- Notificações de vencimento

### RN103 - Sistema de Pagamentos

- Cursos pagos vs gratuitos
- Integração com gateway de pagamento
- Cupons de desconto
- Reembolso (condições)

---

**Última atualização:** 30 de dezembro de 2025
**Versão:** 1.0.0
