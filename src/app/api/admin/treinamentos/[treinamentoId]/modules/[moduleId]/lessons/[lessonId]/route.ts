import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Buscar aula específica
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ treinamentoId: string; moduleId: string; lessonId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { lessonId } = await params;

    const lesson = await prisma.trainingLesson.findUnique({
      where: { id: lessonId },
      include: {
        quizzes: {
          include: {
            questions: {
              include: {
                answers: true,
              },
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Aula não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(lesson);
  } catch (error) {
    console.error("Erro ao buscar aula:", error);
    return NextResponse.json(
      { error: "Erro ao buscar aula" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar aula
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ treinamentoId: string; moduleId: string; lessonId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { lessonId } = await params;
    const data = await req.json();

    const { title, description, content, videoUrl, order } = data;

    const lesson = await prisma.trainingLesson.update({
      where: { id: lessonId },
      data: {
        title,
        description,
        content,
        videoUrl,
        order,
      },
    });

    return NextResponse.json(lesson);
  } catch (error) {
    console.error("Erro ao atualizar aula:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar aula" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir aula
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ treinamentoId: string; moduleId: string; lessonId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { lessonId } = await params;

    await prisma.trainingLesson.delete({
      where: { id: lessonId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir aula:", error);
    return NextResponse.json(
      { error: "Erro ao excluir aula" },
      { status: 500 }
    );
  }
}
