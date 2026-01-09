import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET - Listar todos os funcionários
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    const whereClause = companyId ? { companyId } : {};

    const employees = await prisma.user.findMany({
      where: {
        role: "EMPLOYEE",
        ...whereClause,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        trainingEnrollments: {
          include: {
            training: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        trainingCertificates: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(employees);
  } catch (error) {
    console.error("Erro ao listar funcionários:", error);
    return NextResponse.json(
      { error: "Erro ao listar funcionários" },
      { status: 500 }
    );
  }
}

// POST - Criar novo funcionário
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

    const { name, email, cpf, phone, companyId, password } = data;

    // Validações
    if (!name || !email || !companyId) {
      return NextResponse.json(
        { error: "Nome, email e empresa são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Já existe um usuário com este email" },
        { status: 400 }
      );
    }

    // Verificar se a empresa existe
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Empresa não encontrada" },
        { status: 404 }
      );
    }

    // Criar senha padrão ou usar a fornecida
    const defaultPassword = password || "123456";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const employee = await prisma.user.create({
      data: {
        name,
        email,
        cpf: cpf || null,
        phone: phone || null,
        password: hashedPassword,
        role: "EMPLOYEE",
        companyId,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar funcionário:", error);
    return NextResponse.json(
      { error: "Erro ao criar funcionário" },
      { status: 500 }
    );
  }
}
