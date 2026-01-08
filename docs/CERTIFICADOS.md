# Sistema de Certificados - Guia Completo

## Visão Geral

O sistema de certificados permite que administradores criem templates personalizados em formato Word (.docx) e gerem automaticamente certificados quando os alunos concluem os cursos.

## Funcionalidades Implementadas

### 1. Gerenciamento de Templates (Admin)

**Localização:** Menu Admin → Templates de Certificado (`/admin/certificate-templates`)

**Recursos:**
- Upload de templates em formato .docx (máximo 10MB)
- Definir template padrão
- Visualizar todos os templates cadastrados
- Baixar templates existentes
- Excluir templates

### 2. Variáveis Disponíveis

Use as seguintes variáveis no seu arquivo Word. Elas serão substituídas automaticamente:

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `{nome}` | Nome completo do aluno | João da Silva |
| `{cpf}` | CPF do aluno | 123.456.789-00 |
| `{curso}` | Título do curso | JavaScript Moderno |
| `{carga_horaria}` | Duração do curso | 40 horas |
| `{data}` | Data de conclusão | 30 de dezembro de 2025 |
| `{nota}` | Nota final do aluno | 95.5 |
| `{hash}` | ID único do certificado | A1B2C3D4E5F6G7H8 |

### 3. Como Criar um Template

1. **Crie um documento Word (.docx)**
   - Abra o Microsoft Word ou LibreOffice Writer
   - Crie o design do seu certificado
   - Insira as variáveis onde desejar (use chaves `{}`)

2. **Exemplo de Template:**

```
                    CERTIFICADO DE CONCLUSÃO

Certificamos que {nome}, portador(a) do CPF {cpf}, concluiu com êxito
o curso "{curso}" com carga horária de {carga_horaria}, obtendo a
nota final de {nota}%.

Emitido em: {data}

ID do Certificado: {hash}
```

3. **Faça Upload do Template**
   - Acesse: Admin → Templates de Certificado
   - Clique em "Novo Template"
   - Preencha o nome e descrição
   - Selecione seu arquivo .docx
   - Clique em "Criar Template"

4. **Defina como Padrão**
   - Clique em "Definir como Padrão" no template criado
   - Este template será usado automaticamente para novos certificados

### 4. Geração Automática de Certificados

**Quando é gerado:**
- Automaticamente quando o aluno é aprovado na prova final do curso
- Nota do aluno deve ser maior ou igual à nota mínima configurada no curso

**Requisitos:**
1. Aluno deve estar matriculado e aprovado no curso
2. Aluno deve passar na prova final
3. Deve existir pelo menos um template de certificado cadastrado (preferencialmente marcado como padrão)

**Informações incluídas:**
- Hash único de 16 caracteres para verificação
- Dados do aluno (nome, CPF)
- Dados do curso (título, carga horária)
- Nota final obtida
- Data de emissão

### 5. Visualização de Certificados (Aluno)

**Localização:** Dashboard do Aluno → Certificados (`/dashboard/certificates`)

**O que o aluno pode ver:**
- Lista de todos os certificados obtidos
- Hash único de cada certificado
- Nota final
- Data de emissão
- Botão para baixar o certificado

**Download:**
- O certificado é salvo em formato .docx no MinIO
- O aluno pode baixar clicando no botão "Baixar Certificado"

### 6. Estrutura de Dados

**Banco de Dados:**
- `CertificateTemplate`: Templates de certificado
  - `name`: Nome do template
  - `description`: Descrição opcional
  - `templateUrl`: URL do arquivo no MinIO
  - `isDefault`: Se é o template padrão

- `Certificate`: Certificados emitidos
  - `certificateHash`: Hash único de 16 caracteres (SHA-256)
  - `studentId`: ID do aluno
  - `courseId`: ID do curso
  - `templateId`: ID do template usado
  - `finalScore`: Nota final
  - `pdfUrl`: URL do certificado gerado no MinIO
  - `issueDate`: Data de emissão

**Armazenamento (MinIO):**
- Templates: `certificate-templates/`
- Certificados gerados: `certificates/`

## API Endpoints

### Admin - Templates

**GET** `/api/admin/certificate-templates`
- Lista todos os templates
- Requer: Autenticação como ADMIN

**POST** `/api/admin/certificate-templates`
- Cria novo template
- Body: FormData com `file`, `name`, `description`
- Requer: Autenticação como ADMIN

**DELETE** `/api/admin/certificate-templates/[id]`
- Exclui template
- Requer: Autenticação como ADMIN

**PATCH** `/api/admin/certificate-templates/[id]/set-default`
- Define template como padrão
- Requer: Autenticação como ADMIN

### Certificados

**POST** `/api/certificates/generate`
- Gera certificado para um aluno
- Body: `{ studentId, courseId, templateId? }`
- Requer: Autenticação (ADMIN ou o próprio aluno)
- Validações:
  - Verifica se aluno completou o curso
  - Verifica se passou na prova final
  - Verifica se já existe certificado
  - Busca template (padrão ou especificado)

## Tecnologias Utilizadas

- **docxtemplater**: Processamento de templates Word
- **pizzip**: Manipulação de arquivos .docx (ZIP)
- **MinIO**: Armazenamento de arquivos
- **Prisma**: ORM para banco de dados
- **Next.js**: Framework React

## Observações Importantes

1. **CPF do Aluno:**
   - Certifique-se de que os alunos tenham CPF cadastrado
   - Acesse Admin → Alunos para adicionar CPF aos usuários

2. **Formato do Arquivo:**
   - Apenas arquivos .docx são aceitos
   - Arquivos .doc (formato antigo) não são suportados

3. **Tamanho do Arquivo:**
   - Máximo de 10MB por template

4. **Conversão para PDF:**
   - Atualmente, os certificados são salvos em .docx
   - Para converter para PDF, será necessário integrar uma solução como LibreOffice ou Gotenberg em produção

5. **Hash Único:**
   - Cada certificado recebe um hash único SHA-256 de 16 caracteres
   - Use este hash para verificação de autenticidade

## Próximos Passos (Melhorias Futuras)

- [ ] Conversão automática de .docx para PDF
- [ ] Página pública de verificação de certificados usando o hash
- [ ] Templates com imagens e logos
- [ ] Múltiplos templates por curso
- [ ] Assinatura digital nos certificados
- [ ] Preview do certificado antes de gerar
- [ ] Reemissão de certificados

## Suporte

Para dúvidas ou problemas:
1. Verifique se o MinIO está rodando (`docker ps`)
2. Verifique se existe template padrão cadastrado
3. Verifique os logs do servidor Next.js
4. Consulte a documentação do Prisma para questões de banco de dados
