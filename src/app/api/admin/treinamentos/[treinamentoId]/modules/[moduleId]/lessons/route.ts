import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST - Criar nova aula
export async function POST(
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

    const { title, description, content, videoUrl } = data;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Título e conteúdo são obrigatórios" },
        { status: 400 }
      );
    }

    // Buscar ordem da última aula
    const lastLesson = await prisma.trainingLesson.findFirst({
      where: { moduleId },
      orderBy: { order: "desc" },
    });

    const newOrder = lastLesson ? lastLesson.order + 1 : 1;

    const lesson = await prisma.trainingLesson.create({
      data: {
        title,
        description: description || null,
        content,
        videoUrl: videoUrl || null,
        order: newOrder,
        moduleId,
      },
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar aula:", error);
    return NextResponse.json(
      { error: "Erro ao criar aula" },
      { status: 500 }
    );
  }
}
