import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET - Buscar funcionário específico
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ funcionarioId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { funcionarioId } = await params;

    const employee = await prisma.user.findUnique({
      where: { id: funcionarioId, role: "EMPLOYEE" },
      include: {
        company: true,
        trainingEnrollments: {
          include: {
            training: true,
          },
        },
        trainingCertificates: {
          include: {
            training: true,
          },
        },
        trainingProgress: true,
      },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Funcionário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error("Erro ao buscar funcionário:", error);
    return NextResponse.json(
      { error: "Erro ao buscar funcionário" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar funcionário
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ funcionarioId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { funcionarioId } = await params;
    const data = await req.json();

    const { name, email, cpf, phone, companyId, password } = data;

    // Verificar se existe
    const existingEmployee = await prisma.user.findUnique({
      where: { id: funcionarioId, role: "EMPLOYEE" },
    });

    if (!existingEmployee) {
      return NextResponse.json(
        { error: "Funcionário não encontrado" },
        { status: 404 }
      );
    }

    // Se mudou o email, verificar duplicidade
    if (email && email !== existingEmployee.email) {
      const duplicateEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (duplicateEmail) {
        return NextResponse.json(
          { error: "Já existe um usuário com este email" },
          { status: 400 }
        );
      }
    }

    const updateData: Record<string, unknown> = {
      name: name || existingEmployee.name,
      email: email || existingEmployee.email,
      cpf: cpf !== undefined ? cpf : existingEmployee.cpf,
      phone: phone !== undefined ? phone : existingEmployee.phone,
      companyId: companyId || existingEmployee.companyId,
    };

    // Se forneceu nova senha, criptografar
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const employee = await prisma.user.update({
      where: { id: funcionarioId },
      data: updateData,
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(employee);
  } catch (error) {
    console.error("Erro ao atualizar funcionário:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar funcionário" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir funcionário
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ funcionarioId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { funcionarioId } = await params;

    await prisma.user.delete({
      where: { id: funcionarioId, role: "EMPLOYEE" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir funcionário:", error);
    return NextResponse.json(
      { error: "Erro ao excluir funcionário" },
      { status: 500 }
    );
  }
}
