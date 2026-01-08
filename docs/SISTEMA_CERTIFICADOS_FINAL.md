# 🎓 Sistema de Certificados - Documentação Final

## ✅ Status: TOTALMENTE FUNCIONAL

O sistema de certificados está 100% implementado e testado!

---

## 🎯 Como Funciona

### Para Administradores

#### 1️⃣ **Criar Template de Certificado (Word)**

1. Crie um documento Word (.docx) com o design do certificado
2. Use as variáveis especiais no texto:
   - `{nome}` - Nome do aluno
   - `{cpf}` - CPF do aluno
   - `{curso}` - Título do curso
   - `{carga_horaria}` - Duração do curso
   - `{data}` - Data de conclusão
   - `{nota}` - Nota final
   - `{hash}` - ID único do certificado

**Exemplo de Template Word:**
```
                    CERTIFICADO DE CONCLUSÃO

Certificamos que {nome}, portador(a) do CPF {cpf}, concluiu
com êxito o curso "{curso}" com carga horária de {carga_horaria}.

Nota Final: {nota}%

Emitido em: {data}

ID do Certificado: {hash}
```

#### 2️⃣ **Upload do Template**

1. Acesse: **Admin → Templates de Certificado**
2. Clique em **"Novo Template"**
3. Preencha:
   - Nome: Ex: "Certificado Padrão"
   - Descrição: Ex: "Template oficial da SkillPro"
4. Faça upload do arquivo .docx
5. Defina como **"Padrão"** (opcional)

#### 3️⃣ **Associar Template ao Curso**

1. Ao criar um curso em **Admin → Gerenciar Cursos**
2. Selecione o template desejado no campo **"Template de Certificado"**
3. Se não selecionar, o template padrão será usado

---

### Para Alunos

#### 📚 **Fluxo Completo**

1. **Matrícula:** Admin aprova a inscrição
2. **Estudo:** Aluno completa todas as aulas
3. **Prova Final:** Aluno faz a prova e precisa obter nota ≥ 70%
4. **Certificado:** Gerado automaticamente ao passar na prova
5. **Download:** Aluno baixa o PDF em "Certificados"

---

## 🔧 Processo Técnico

### Fluxo de Geração do Certificado

```
1. Aluno passa na prova final (nota ≥ 70%)
   ↓
2. Sistema busca template (prioridade: Curso → Padrão → HTML)
   ↓
3. Template Word encontrado?
   ├─ SIM:
   │   ├─ Download do .docx do MinIO
   │   ├─ Processar com docxtemplater (substituir variáveis)
   │   ├─ Converter DOCX processado → HTML (mammoth)
   │   └─ Converter HTML → PDF (puppeteer)
   │
   └─ NÃO:
       └─ Gerar PDF direto com template HTML padrão
   ↓
4. Gerar assinatura digital (SHA-256)
   ↓
5. Upload do PDF para MinIO
   ↓
6. Salvar no banco de dados
   ↓
7. Aluno pode baixar em "Certificados"
```

---

## 📊 Tecnologias Utilizadas

### Processamento de Documentos
- **docxtemplater** - Processar templates Word
- **pizzip** - Manipular arquivos .docx (ZIP)
- **mammoth** - Converter DOCX para HTML
- **puppeteer** - Converter HTML para PDF

### Armazenamento
- **MinIO** - S3-compatible object storage
- **PostgreSQL** - Banco de dados relacional

### Segurança
- **SHA-256** - Hash único do certificado
- **Assinatura Digital** - Validação de autenticidade

---

## 🎨 Resultado Final

### Template Word (Upload)
- Formato: .docx
- Tamanho: ~341 KB
- Designer pode formatar livremente

### Certificado Gerado (Download do Aluno)
- Formato: **PDF** ✓
- Tamanho: ~120 KB
- Mantém formatação do Word
- Pronto para impressão

---

## 📋 Variáveis Disponíveis

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `{nome}` | Nome completo do aluno | Student User |
| `{cpf}` | CPF do aluno | 123.456.789-00 |
| `{curso}` | Título do curso | React Avançado |
| `{carga_horaria}` | Duração do curso | 20 horas |
| `{data}` | Data de conclusão | 30 de dezembro de 2025 |
| `{nota}` | Nota final | 100.0 |
| `{hash}` | ID único do certificado | DC5AE4AA70FA0FC2 |

---

## 🔗 URLs e Links

### Páginas do Sistema

**Admin:**
- Templates: http://localhost:3000/admin/certificate-templates
- Cursos: http://localhost:3000/admin/courses

**Aluno:**
- Login: http://localhost:3000/login
- Certificados: http://localhost:3000/dashboard/certificates

**Público:**
- Verificação: http://localhost:3000/verificar/[HASH]

### MinIO
- Console: http://localhost:9001
- Usuário: `skillpro`
- Senha: `skillpro123`

---

## 🧪 Teste Completo

### Dados de Teste Criados

```
👤 Aluno
   Email: student@skillpro.com
   Senha: student123
   Nome: Student User
   CPF: 123.456.789-00

📚 Curso
   Título: Teste de Certificação - React Avançado
   Status: Todas as aulas completadas
   Prova: 3 questões (100% acertadas)

🎓 Certificado
   Hash: DC5AE4AA70FA0FC2
   Formato: PDF (120 KB)
   Status: ✅ Pronto para download
```

### Como Testar

**Passo 1: Login**
```
http://localhost:3000/login
Email: student@skillpro.com
Senha: student123
```

**Passo 2: Baixar Certificado**
1. Clique em **"Certificados"**
2. Clique em **"Baixar Certificado"**
3. Arquivo PDF será baixado

**Passo 3: Verificar Autenticidade**
```
http://localhost:3000/verificar/DC5AE4AA70FA0FC2
```

---

## 🔐 Segurança

### Hash Único
- Algoritmo: SHA-256
- Comprimento: 16 caracteres
- Formato: `DC5AE4AA70FA0FC2`
- Único por certificado

### Assinatura Digital
- Dados: `{hash}-{studentId}-{courseId}-{nota}`
- Algoritmo: SHA-256 com secret key
- Validação: Automática na página de verificação

### Verificação Pública
- Qualquer pessoa pode verificar autenticidade
- Mostra todos os dados do certificado
- Valida assinatura digital
- Mostra status ✅ ou ❌

---

## 📦 Arquivos do Sistema

### Principais

**Backend:**
- `src/app/api/certificates/generate/route.ts` - API de geração
- `src/lib/docx-to-pdf.ts` - Conversão DOCX → PDF
- `src/lib/pdf-converter.ts` - Geração de PDF direto
- `src/lib/minio.ts` - Upload de arquivos

**Frontend:**
- `src/app/admin/certificate-templates/page.tsx` - Admin templates
- `src/app/dashboard/certificates/page.tsx` - Certificados do aluno
- `src/app/verificar/[hash]/page.tsx` - Verificação pública

**Scripts:**
- `scripts/generate-certificate-direct.ts` - Gerar certificado manual
- `scripts/create-test-course.ts` - Criar curso de teste
- `scripts/test-pdf-generation.ts` - Testar geração de PDF

---

## 💡 Dicas

### Para Melhor Resultado

1. **Use fontes padrão no Word:**
   - Times New Roman
   - Arial
   - Georgia
   - Calibri

2. **Formatação:**
   - Orientação paisagem funciona melhor
   - Use tamanho A4
   - Evite imagens muito grandes

3. **Teste o Template:**
   - Faça upload
   - Gere um certificado de teste
   - Verifique a formatação no PDF
   - Ajuste o Word se necessário

---

## 🚀 Comandos Úteis

### Gerar Certificado Manual
```bash
npx tsx scripts/generate-certificate-direct.ts
```

### Criar Curso de Teste
```bash
npx tsx scripts/create-test-course.ts
```

### Limpar Certificados
```bash
docker exec -i skillpro-postgres psql -U postgres -d skillpro -c "DELETE FROM certificates;"
```

### Configurar MinIO
```bash
node scripts/init-minio.js
```

---

## ✅ Checklist de Funcionalidades

- [x] Upload de template Word (.docx)
- [x] Processamento de variáveis no Word
- [x] Conversão automática DOCX → PDF
- [x] Geração automática ao passar na prova
- [x] Hash único (16 caracteres)
- [x] Assinatura digital
- [x] Upload para MinIO
- [x] Download em PDF pelo aluno
- [x] Página de verificação pública
- [x] Validação de assinatura
- [x] Template padrão
- [x] Template por curso
- [x] Permissões públicas no MinIO

---

## 📞 Suporte

### Problemas Comuns

**1. Certificado não baixa (AccessDenied)**
```bash
docker exec -i skillpro-minio mc anonymous set download myminio/skillpro
```

**2. PDF mal formatado**
- Verifique o template Word
- Use fontes padrão
- Evite formatações complexas

**3. Variáveis não substituídas**
- Certifique-se de usar chaves: `{nome}`
- Não use espaços: `{ nome }` ❌
- Use exatamente como documentado

---

## 🎉 Conclusão

O sistema está **100% funcional**:

✅ Admin faz upload de template Word
✅ Sistema processa e converte para PDF
✅ Aluno baixa certificado em PDF
✅ Verificação pública funcionando
✅ Assinatura digital validada

**Status:** PRONTO PARA PRODUÇÃO! 🚀
