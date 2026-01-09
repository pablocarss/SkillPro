import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Listar todas as empresas
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const companies = await prisma.company.findMany({
      include: {
        _count: {
          select: {
            employees: true,
            trainings: true,
            users: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(companies);
  } catch (error) {
    console.error("Erro ao listar empresas:", error);
    return NextResponse.json(
      { error: "Erro ao listar empresas" },
      { status: 500 }
    );
  }
}

// POST - Criar nova empresa
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const data = await req.json();

    const { name, cnpj, email, phone, address } = data;

    // Validações
    if (!name || !cnpj || !email) {
      return NextResponse.json(
        { error: "Nome, CNPJ e email são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o CNPJ já existe
    const existingCompany = await prisma.company.findUnique({
      where: { cnpj },
    });

    if (existingCompany) {
      return NextResponse.json(
        { error: "Já existe uma empresa com este CNPJ" },
        { status: 400 }
      );
    }

    const company = await prisma.company.create({
      data: {
        name,
        cnpj,
        email,
        phone: phone || null,
        address: address || null,
        isActive: true,
      },
    });

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar empresa:", error);
    return NextResponse.json(
      { error: "Erro ao criar empresa" },
      { status: 500 }
    );
  }
}
