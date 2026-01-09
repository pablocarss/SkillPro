import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Listar módulos do treinamento
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ treinamentoId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { treinamentoId } = await params;

    const modules = await prisma.trainingModule.findMany({
      where: { trainingId: treinamentoId },
      include: {
        lessons: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(modules);
  } catch (error) {
    console.error("Erro ao listar módulos:", error);
    return NextResponse.json(
      { error: "Erro ao listar módulos" },
      { status: 500 }
    );
  }
}

// POST - Criar novo módulo
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ treinamentoId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { treinamentoId } = await params;
    const data = await req.json();

    const { title, description } = data;

    if (!title) {
      return NextResponse.json(
        { error: "Título é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar ordem do último módulo
    const lastModule = await prisma.trainingModule.findFirst({
      where: { trainingId: treinamentoId },
      orderBy: { order: "desc" },
    });

    const newOrder = lastModule ? lastModule.order + 1 : 1;

    const module = await prisma.trainingModule.create({
      data: {
        title,
        description: description || null,
        order: newOrder,
        trainingId: treinamentoId,
      },
      include: {
        lessons: true,
      },
    });

    return NextResponse.json(module, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar módulo:", error);
    return NextResponse.json(
      { error: "Erro ao criar módulo" },
      { status: 500 }
    );
  }
}
