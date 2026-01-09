import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Buscar empresa específica
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ empresaId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { empresaId } = await params;

    const company = await prisma.company.findUnique({
      where: { id: empresaId },
      include: {
        employees: true,
        trainings: {
          include: {
            _count: {
              select: {
                enrollments: true,
                modules: true,
              },
            },
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            employees: true,
            trainings: true,
            users: true,
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Empresa não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error("Erro ao buscar empresa:", error);
    return NextResponse.json(
      { error: "Erro ao buscar empresa" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar empresa
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ empresaId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { empresaId } = await params;
    const data = await req.json();

    const { name, cnpj, email, phone, address, isActive } = data;

    // Verificar se existe
    const existingCompany = await prisma.company.findUnique({
      where: { id: empresaId },
    });

    if (!existingCompany) {
      return NextResponse.json(
        { error: "Empresa não encontrada" },
        { status: 404 }
      );
    }

    // Se mudou o CNPJ, verificar duplicidade
    if (cnpj && cnpj !== existingCompany.cnpj) {
      const duplicateCnpj = await prisma.company.findUnique({
        where: { cnpj },
      });

      if (duplicateCnpj) {
        return NextResponse.json(
          { error: "Já existe uma empresa com este CNPJ" },
          { status: 400 }
        );
      }
    }

    const company = await prisma.company.update({
      where: { id: empresaId },
      data: {
        name: name || existingCompany.name,
        cnpj: cnpj || existingCompany.cnpj,
        email: email || existingCompany.email,
        phone: phone !== undefined ? phone : existingCompany.phone,
        address: address !== undefined ? address : existingCompany.address,
        isActive: isActive !== undefined ? isActive : existingCompany.isActive,
      },
    });

    return NextResponse.json(company);
  } catch (error) {
    console.error("Erro ao atualizar empresa:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar empresa" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir empresa
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ empresaId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { empresaId } = await params;

    await prisma.company.delete({
      where: { id: empresaId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir empresa:", error);
    return NextResponse.json(
      { error: "Erro ao excluir empresa" },
      { status: 500 }
    );
  }
}
