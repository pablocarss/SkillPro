import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ExcelJS from "exceljs";

// GET - Download modelo Excel para importação de funcionários
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Criar workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "SkillPro";
    workbook.created = new Date();

    // Criar worksheet
    const worksheet = workbook.addWorksheet("Funcionários", {
      properties: { defaultColWidth: 20 }
    });

    // Definir colunas
    worksheet.columns = [
      { header: "Nome", key: "nome", width: 30 },
      { header: "Email", key: "email", width: 35 },
      { header: "CPF", key: "cpf", width: 18 },
      { header: "Telefone", key: "telefone", width: 18 },
      { header: "Cargo", key: "cargo", width: 25 }
    ];

    // Estilizar cabeçalho
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1E40AF" } // Azul escuro
    };
    headerRow.alignment = { horizontal: "center", vertical: "middle" };
    headerRow.height = 25;

    // Adicionar linha de exemplo
    worksheet.addRow({
      nome: "João da Silva",
      email: "joao.silva@empresa.com",
      cpf: "123.456.789-00",
      telefone: "(11) 99999-9999",
      cargo: "Analista de Sistemas"
    });

    // Estilizar linha de exemplo (itálico para indicar que é exemplo)
    const exampleRow = worksheet.getRow(2);
    exampleRow.font = { italic: true, color: { argb: "FF666666" } };

    // Adicionar mais linhas vazias para facilitar preenchimento
    for (let i = 0; i < 10; i++) {
      worksheet.addRow({});
    }

    // Adicionar validação de dados
    // Email
    worksheet.getColumn("email").eachCell((cell, rowNumber) => {
      if (rowNumber > 1) {
        cell.dataValidation = {
          type: "textLength",
          operator: "greaterThan",
          formulae: ["0"],
          showErrorMessage: true,
          errorTitle: "Email obrigatório",
          error: "Por favor, insira um email válido"
        };
      }
    });

    // Adicionar comentários nas células do cabeçalho
    worksheet.getCell("A1").note = "Nome completo do funcionário (obrigatório)";
    worksheet.getCell("B1").note = "Email corporativo do funcionário (obrigatório)";
    worksheet.getCell("C1").note = "CPF do funcionário (opcional, formato: 000.000.000-00)";
    worksheet.getCell("D1").note = "Telefone de contato (opcional, formato: (00) 00000-0000)";
    worksheet.getCell("E1").note = "Cargo ou função do funcionário na empresa (opcional)";

    // Bordas em todas as células com dados
    const borderStyle: Partial<ExcelJS.Border> = { style: "thin", color: { argb: "FFD0D0D0" } };
    for (let row = 1; row <= 12; row++) {
      for (let col = 1; col <= 5; col++) {
        const cell = worksheet.getCell(row, col);
        cell.border = {
          top: borderStyle,
          left: borderStyle,
          bottom: borderStyle,
          right: borderStyle
        };
      }
    }

    // Adicionar sheet de instruções
    const instructionsSheet = workbook.addWorksheet("Instruções");
    instructionsSheet.columns = [
      { header: "", key: "content", width: 80 }
    ];

    const instructions = [
      "INSTRUÇÕES PARA IMPORTAÇÃO DE FUNCIONÁRIOS",
      "",
      "1. Preencha os dados dos funcionários na aba 'Funcionários'",
      "2. A primeira linha de exemplo pode ser removida ou substituída",
      "",
      "CAMPOS:",
      "• Nome: Nome completo do funcionário (OBRIGATÓRIO)",
      "• Email: Email do funcionário, será usado para login (OBRIGATÓRIO)",
      "• CPF: CPF do funcionário (opcional, formato: 000.000.000-00 ou apenas números)",
      "• Telefone: Telefone de contato (opcional)",
      "• Cargo: Cargo ou função na empresa (opcional)",
      "",
      "OBSERVAÇÕES:",
      "• Emails duplicados serão ignorados",
      "• CPFs duplicados serão ignorados",
      "• A senha padrão será definida no momento da importação",
      "• Os funcionários receberão o papel de EMPLOYEE automaticamente"
    ];

    instructions.forEach((text, index) => {
      const row = instructionsSheet.addRow({ content: text });
      if (index === 0) {
        row.font = { bold: true, size: 14 };
      } else if (text.startsWith("CAMPOS:") || text.startsWith("OBSERVAÇÕES:")) {
        row.font = { bold: true };
      }
    });

    // Gerar buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Retornar arquivo
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=modelo_funcionarios.xlsx"
      }
    });
  } catch (error) {
    console.error("Erro ao gerar modelo Excel:", error);
    return NextResponse.json(
      { error: "Erro ao gerar modelo" },
      { status: 500 }
    );
  }
}
