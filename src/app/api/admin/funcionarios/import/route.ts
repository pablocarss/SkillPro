import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import ExcelJS from "exceljs";

interface EmployeeRow {
  nome: string;
  email: string;
  cpf?: string;
  telefone?: string;
  cargo?: string;
}

interface ImportResult {
  success: boolean;
  email: string;
  name: string;
  error?: string;
}

// Função para validar CPF
function isValidCPF(cpf: string): boolean {
  if (!cpf) return true; // CPF é opcional

  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, "");

  if (cleanCPF.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleanCPF)) return false;

  // Validação dos dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF[i]) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF[i]) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF[10])) return false;

  return true;
}

// Função para formatar CPF
function formatCPF(cpf: string): string | null {
  if (!cpf) return null;
  const cleanCPF = cpf.replace(/\D/g, "");
  if (cleanCPF.length !== 11) return null;
  return cleanCPF;
}

// Função para validar email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// POST - Importar funcionários via Excel
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const companyId = formData.get("companyId") as string | null;
    const defaultPassword = formData.get("password") as string || "123456";

    if (!file) {
      return NextResponse.json(
        { error: "Arquivo é obrigatório" },
        { status: 400 }
      );
    }

    if (!companyId) {
      return NextResponse.json(
        { error: "ID da empresa é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se a empresa existe
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      return NextResponse.json(
        { error: "Empresa não encontrada" },
        { status: 404 }
      );
    }

    // Ler arquivo Excel
    const bytes = await file.arrayBuffer();
    const uint8Array = new Uint8Array(bytes);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(uint8Array as any);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      return NextResponse.json(
        { error: "Planilha vazia ou inválida" },
        { status: 400 }
      );
    }

    // Mapear colunas (procurar cabeçalho na primeira linha)
    const headerRow = worksheet.getRow(1);
    const columnMap: { [key: string]: number } = {};

    headerRow.eachCell((cell, colNumber) => {
      const value = String(cell.value || "").toLowerCase().trim();
      if (value.includes("nome") || value === "name") {
        columnMap.nome = colNumber;
      } else if (value.includes("email") || value.includes("e-mail")) {
        columnMap.email = colNumber;
      } else if (value.includes("cpf")) {
        columnMap.cpf = colNumber;
      } else if (value.includes("telefone") || value.includes("phone") || value.includes("celular")) {
        columnMap.telefone = colNumber;
      } else if (value.includes("cargo") || value.includes("função") || value.includes("funcao") || value.includes("position")) {
        columnMap.cargo = colNumber;
      }
    });

    // Verificar colunas obrigatórias
    if (!columnMap.nome || !columnMap.email) {
      return NextResponse.json(
        { error: "Colunas obrigatórias não encontradas: Nome e Email" },
        { status: 400 }
      );
    }

    // Processar linhas (começando da linha 2)
    const employees: EmployeeRow[] = [];
    const validationErrors: { row: number; error: string }[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Pular cabeçalho

      const nome = String(row.getCell(columnMap.nome).value || "").trim();
      const email = String(row.getCell(columnMap.email).value || "").trim().toLowerCase();
      const cpf = columnMap.cpf ? String(row.getCell(columnMap.cpf).value || "").trim() : "";
      const telefone = columnMap.telefone ? String(row.getCell(columnMap.telefone).value || "").trim() : "";
      const cargo = columnMap.cargo ? String(row.getCell(columnMap.cargo).value || "").trim() : "";

      // Pular linhas vazias
      if (!nome && !email) return;

      // Validações
      if (!nome) {
        validationErrors.push({ row: rowNumber, error: "Nome é obrigatório" });
        return;
      }

      if (!email) {
        validationErrors.push({ row: rowNumber, error: "Email é obrigatório" });
        return;
      }

      if (!isValidEmail(email)) {
        validationErrors.push({ row: rowNumber, error: `Email inválido: ${email}` });
        return;
      }

      if (cpf && !isValidCPF(cpf)) {
        validationErrors.push({ row: rowNumber, error: `CPF inválido: ${cpf}` });
        return;
      }

      employees.push({
        nome,
        email,
        cpf: formatCPF(cpf) || undefined,
        telefone: telefone || undefined,
        cargo: cargo || undefined
      });
    });

    if (employees.length === 0) {
      return NextResponse.json(
        {
          error: "Nenhum funcionário válido encontrado na planilha",
          validationErrors
        },
        { status: 400 }
      );
    }

    // Hash da senha padrão
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Criar funcionários
    const results: ImportResult[] = [];
    let created = 0;
    let duplicates = 0;
    let errors = 0;

    for (const emp of employees) {
      try {
        // Verificar se email já existe
        const existingUser = await prisma.user.findUnique({
          where: { email: emp.email }
        });

        if (existingUser) {
          duplicates++;
          results.push({
            success: false,
            email: emp.email,
            name: emp.nome,
            error: "Email já cadastrado"
          });
          continue;
        }

        // Verificar se CPF já existe (se fornecido)
        if (emp.cpf) {
          const existingCPF = await prisma.user.findUnique({
            where: { cpf: emp.cpf }
          });

          if (existingCPF) {
            duplicates++;
            results.push({
              success: false,
              email: emp.email,
              name: emp.nome,
              error: "CPF já cadastrado"
            });
            continue;
          }
        }

        // Criar usuário
        await prisma.user.create({
          data: {
            email: emp.email,
            name: emp.nome,
            password: hashedPassword,
            cpf: emp.cpf,
            phone: emp.telefone,
            position: emp.cargo,
            role: "EMPLOYEE",
            companyId
          }
        });

        created++;
        results.push({
          success: true,
          email: emp.email,
          name: emp.nome
        });
      } catch (error) {
        errors++;
        results.push({
          success: false,
          email: emp.email,
          name: emp.nome,
          error: "Erro ao criar funcionário"
        });
      }
    }

    return NextResponse.json({
      message: `Importação concluída: ${created} criados, ${duplicates} duplicados, ${errors} erros`,
      summary: {
        total: employees.length,
        created,
        duplicates,
        errors
      },
      results,
      validationErrors
    });
  } catch (error) {
    console.error("Erro ao importar funcionários:", error);
    return NextResponse.json(
      { error: "Erro ao processar arquivo" },
      { status: 500 }
    );
  }
}
