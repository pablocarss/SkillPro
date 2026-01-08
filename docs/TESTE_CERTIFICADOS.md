# 🎓 Sistema de Certificados - Guia de Teste Completo

## ✅ Status: IMPLEMENTADO E TESTADO

Todas as 4 funcionalidades foram implementadas e testadas com sucesso!

---

## 🎯 Funcionalidades Implementadas

### 1. ✅ Conversão Automática para PDF
- **Status:** ✓ Funcionando
- **Tecnologia:** Puppeteer + HTML/CSS
- **Resultado:** PDF profissional de 223KB
- **Design:**
  - Layout paisagem A4
  - Gradiente roxo/azul elegante
  - Bordas douradas ornamentais
  - Tipografia Georgia/Times New Roman
  - Todas as informações do certificado

### 2. ✅ Página Pública de Verificação
- **URL:** `http://localhost:3000/verificar/[HASH]`
- **Status:** ✓ Funcionando
- **Recursos:**
  - Validação de certificado por hash
  - Verificação de assinatura digital
  - Exibição de dados do aluno
  - Exibição de dados do curso
  - Download do PDF
  - Design responsivo e profissional

### 3. ✅ Assinatura Digital
- **Status:** ✓ Funcionando
- **Algoritmo:** SHA-256
- **Validação:** Automática na página de verificação
- **Componentes:**
  - Hash único de 16 caracteres
  - Assinatura digital baseada em secret key
  - Verificação criptográfica

### 4. ✅ Múltiplos Templates por Curso
- **Status:** ✓ Funcionando
- **Prioridade:** Curso > Especificado > Padrão
- **Interface:**
  - Seleção de template na criação de curso
  - Campo opcional (usa padrão se não selecionado)

---

## 📊 Dados de Teste Criados

```
👤 Aluno
   Nome: Student User
   Email: student@skillpro.com
   Senha: student123
   CPF: 123.456.789-00

📚 Curso
   Título: Teste de Certificação - React Avançado
   Nível: Avançado
   Duração: 20 horas
   Módulos: 2
   Aulas: 3 (todas completadas)

📝 Prova Final
   Questões: 3
   Nota mínima: 70%
   Status: APROVADO (100%)

🎓 Certificado
   Hash: E70F929002BEEDC0
   PDF: Gerado (223 KB)
   Assinatura: ✓ Verificada
```

---

## 🧪 Como Testar

### Método 1: Teste Manual pelo Dashboard

#### Passo 1: Login
```
URL: http://localhost:3000/login
Email: student@skillpro.com
Senha: student123
```

#### Passo 2: Visualizar Certificado
1. Acesse **"Certificados"** no menu lateral
2. Você verá o certificado gerado
3. Clique em **"Baixar Certificado"**
4. O PDF será baixado automaticamente

#### Passo 3: Verificar Autenticidade
1. Copie o hash: `E70F929002BEEDC0`
2. Acesse: `http://localhost:3000/verificar/E70F929002BEEDC0`
3. Você verá:
   - ✅ Certificado Válido
   - 🛡️ Assinatura Digital Verificada
   - Todas as informações do certificado
   - Botão para download

### Método 2: Download Direto do PDF

```
http://localhost:9000/skillpro/certificates/1767074660748-certificado-Student_User-Teste_de_Certifica__o_-_React_Avan_ado.pdf
```

### Método 3: Gerar Novo Certificado

Se você quiser testar novamente do zero:

```bash
# 1. Deletar certificados existentes
docker exec -i skillpro-postgres psql -U postgres -d skillpro -c "DELETE FROM certificates;"

# 2. Deletar tentativas de prova
docker exec -i skillpro-postgres psql -U postgres -d skillpro -c "DELETE FROM student_exam_attempts;"

# 3. Fazer a prova manualmente
# Acesse: http://localhost:3000/dashboard/courses/[courseId]/final-exam
# Responda as questões e envie

# 4. OU gerar diretamente via script
npx tsx scripts/complete-test-flow.ts
npx tsx scripts/generate-certificate-direct.ts
```

---

## 📋 Estrutura do Certificado PDF

### Cabeçalho
```
SKILLPRO - PLATAFORMA DE EDUCAÇÃO
Certificado
de Conclusão de Curso
```

### Corpo
```
Certificamos que Student User, portador(a) do CPF 123.456.789-00,
concluiu com êxito o curso "Teste de Certificação - React Avançado"
com carga horária de 20 horas.

O aluno demonstrou excelente desempenho durante o curso,
obtendo aprovação na avaliação final.

Nota Final: 100.0%

Emitido em 30 de dezembro de 2025
```

### Rodapé
```
___________________
Diretor Acadêmico
SkillPro Educação

Verificar autenticidade em: skillpro.com/verificar/E70F929002BEEDC0
Hash: E70F929002BEEDC0
```

---

## 🔧 Scripts Úteis

### Criar Curso de Teste
```bash
npx tsx scripts/create-test-course.ts
```

### Gerar Certificado Diretamente
```bash
npx tsx scripts/generate-certificate-direct.ts
```

### Testar Geração de PDF
```bash
npx tsx scripts/test-pdf-generation.ts
# Cria: test-certificate.pdf na raiz do projeto
```

### Executar Fluxo Completo
```bash
npx tsx scripts/complete-test-flow.ts
```

---

## 🎨 Personalização do Certificado

O certificado é gerado a partir do template HTML em `src/lib/pdf-converter.ts`.

Para personalizar:
1. Edite os estilos CSS no template
2. Modifique o layout HTML
3. Ajuste cores, fontes e ornamentos
4. Teste com `npx tsx scripts/test-pdf-generation.ts`

---

## 📊 Banco de Dados

### Certificados
```sql
SELECT
  "certificateHash",
  "digitalSignature",
  "finalScore",
  "pdfUrl",
  "issueDate"
FROM certificates
ORDER BY "issueDate" DESC;
```

### Verificar Assinatura
```sql
SELECT
  c."certificateHash",
  u.name,
  co.title,
  c."digitalSignature" IS NOT NULL as "has_signature"
FROM certificates c
JOIN users u ON c."studentId" = u.id
JOIN courses co ON c."courseId" = co.id;
```

---

## 🔗 URLs Importantes

### Páginas do Sistema
- Login: http://localhost:3000/login
- Dashboard: http://localhost:3000/dashboard
- Certificados: http://localhost:3000/dashboard/certificates
- Verificação: http://localhost:3000/verificar/E70F929002BEEDC0

### Admin
- Templates: http://localhost:3000/admin/certificate-templates
- Cursos: http://localhost:3000/admin/courses

### MinIO
- Console: http://localhost:9001
- Usuário: skillpro
- Senha: skillpro123

---

## ✅ Checklist de Teste

- [x] PDF gerado com design profissional
- [x] Hash único de 16 caracteres
- [x] Assinatura digital verificável
- [x] Upload para MinIO bem-sucedido
- [x] Registro no banco de dados
- [x] Página de verificação funcionando
- [x] Download de PDF funcionando
- [x] Validação de assinatura funcionando
- [x] Template de curso selecionável
- [x] Fluxo completo testado

---

## 🎉 Resultado Final

### Certificado Gerado
- **Formato:** PDF (223 KB)
- **Tamanho:** A4 Paisagem
- **Qualidade:** Alta resolução
- **Design:** Profissional e elegante

### Segurança
- **Hash:** E70F929002BEEDC0 (único)
- **Assinatura:** SHA-256 verificada
- **Verificação:** Pública em /verificar/[hash]

### Funcionalidades
- **Download:** ✓ Funcionando
- **Verificação:** ✓ Funcionando
- **Validação:** ✓ Funcionando
- **Templates:** ✓ Funcionando

---

## 📞 Suporte

Em caso de problemas:

1. Verifique se o MinIO está rodando:
   ```bash
   docker ps | grep minio
   ```

2. Verifique se o Puppeteer está instalado:
   ```bash
   npx puppeteer browsers install chrome
   ```

3. Regenere o Prisma Client:
   ```bash
   npx prisma generate
   ```

4. Reinicie o servidor:
   ```bash
   npm run dev
   ```

---

**Status:** ✅ TUDO FUNCIONANDO!
**Data:** 30/12/2025
**Versão:** 1.0.0
