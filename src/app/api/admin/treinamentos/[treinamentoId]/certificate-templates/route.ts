import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

// GET - Listar templates de certificado por empresa
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ treinamentoId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { treinamentoId } = await params;

    const templates = await prisma.trainingCertificateTemplate.findMany({
      where: { trainingId: treinamentoId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            cnpj: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Erro ao buscar templates:", error);
    return NextResponse.json(
      { error: "Erro ao buscar templates" },
      { status: 500 }
    );
  }
}

// POST - Upload de template para empresa específica
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ treinamentoId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { treinamentoId } = await params;
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const companyId = formData.get("companyId") as string | null;
    const name = formData.get("name") as string | null;

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

    // Verificar se a empresa está vinculada ao treinamento
    const trainingCompany = await prisma.trainingCompany.findUnique({
      where: {
        trainingId_companyId: {
          trainingId: treinamentoId,
          companyId
        }
      }
    });

    if (!trainingCompany) {
      return NextResponse.json(
        { error: "A empresa não está vinculada a este treinamento" },
        { status: 400 }
      );
    }

    // Verificar extensão do arquivo
    const fileName = file.name;
    const ext = path.extname(fileName).toLowerCase();
    if (ext !== ".docx") {
      return NextResponse.json(
        { error: "Apenas arquivos .docx são permitidos" },
        { status: 400 }
      );
    }

    // Criar diretório de uploads se não existir
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "certificate-templates");
    await mkdir(uploadsDir, { recursive: true });

    // Gerar nome único para o arquivo
    const uniqueName = `${treinamentoId}_${companyId}_${Date.now()}${ext}`;
    const filePath = path.join(uploadsDir, uniqueName);
    const templateUrl = `/uploads/certificate-templates/${uniqueName}`;

    // Salvar arquivo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Verificar se já existe um template para esta empresa neste treinamento
    const existingTemplate = await prisma.trainingCertificateTemplate.findUnique({
      where: {
        trainingId_companyId: {
          trainingId: treinamentoId,
          companyId
        }
      }
    });

    let template;
    if (existingTemplate) {
      // Deletar arquivo antigo se existir
      try {
        const oldPath = path.join(process.cwd(), "public", existingTemplate.templateUrl);
        await unlink(oldPath);
      } catch (e) {
        // Ignora se arquivo não existir
      }

      // Atualizar template existente
      template = await prisma.trainingCertificateTemplate.update({
        where: { id: existingTemplate.id },
        data: {
          templateUrl,
          name: name || fileName
        },
        include: {
          company: {
            select: { id: true, name: true, cnpj: true }
          }
        }
      });
    } else {
      // Criar novo template
      template = await prisma.trainingCertificateTemplate.create({
        data: {
          trainingId: treinamentoId,
          companyId,
          templateUrl,
          name: name || fileName
        },
        include: {
          company: {
            select: { id: true, name: true, cnpj: true }
          }
        }
      });
    }

    return NextResponse.json({
      message: "Template salvo com sucesso",
      template
    });
  } catch (error) {
    console.error("Erro ao salvar template:", error);
    return NextResponse.json(
      { error: "Erro ao salvar template" },
      { status: 500 }
    );
  }
}

// DELETE - Remover template de certificado
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ treinamentoId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { treinamentoId } = await params;
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json(
        { error: "ID da empresa é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar template para deletar o arquivo
    const template = await prisma.trainingCertificateTemplate.findUnique({
      where: {
        trainingId_companyId: {
          trainingId: treinamentoId,
          companyId
        }
      }
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template não encontrado" },
        { status: 404 }
      );
    }

    // Deletar arquivo
    try {
      const filePath = path.join(process.cwd(), "public", template.templateUrl);
      await unlink(filePath);
    } catch (e) {
      // Ignora se arquivo não existir
    }

    // Deletar registro
    await prisma.trainingCertificateTemplate.delete({
      where: { id: template.id }
    });

    return NextResponse.json({ message: "Template removido com sucesso" });
  } catch (error) {
    console.error("Erro ao remover template:", error);
    return NextResponse.json(
      { error: "Erro ao remover template" },
      { status: 500 }
    );
  }
}
