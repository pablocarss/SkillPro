import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT - Atualizar módulo
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ treinamentoId: string; moduleId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { moduleId } = await params;
    const data = await req.json();

    const { title, description, order } = data;

    const module = await prisma.trainingModule.update({
      where: { id: moduleId },
      data: {
        title,
        description,
        order,
      },
    });

    return NextResponse.json(module);
  } catch (error) {
    console.error("Erro ao atualizar módulo:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar módulo" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir módulo
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ treinamentoId: string; moduleId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { moduleId } = await params;

    await prisma.trainingModule.delete({
      where: { id: moduleId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir módulo:", error);
    return NextResponse.json(
      { error: "Erro ao excluir módulo" },
      { status: 500 }
    );
  }
}
