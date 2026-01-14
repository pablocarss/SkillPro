import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Buscar prova final do treinamento
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ treinamentoId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { treinamentoId } = await params;

    // Verificar se o treinamento existe
    const training = await prisma.training.findUnique({
      where: { id: treinamentoId },
      include: {
        enrollments: {
          where: { userId: session.user.id },
        },
      },
    });

    if (!training) {
      return NextResponse.json(
        { error: "Treinamento não encontrado" },
        { status: 404 }
      );
    }

    // Verificar acesso
    const isAdmin = session.user.role === "ADMIN";
    const isEnrolled = training.enrollments.length > 0;

    if (!isAdmin && !isEnrolled) {
      return NextResponse.json(
        { error: "Você não tem acesso a este treinamento" },
        { status: 403 }
      );
    }

    // Buscar prova final
    const exam = await prisma.trainingFinalExam.findUnique({
      where: { trainingId: treinamentoId },
      include: {
        questions: {
          orderBy: { order: "asc" },
          include: {
            answers: true,
          },
        },
        attempts: {
          where: { userId: session.user.id },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!exam) {
      return NextResponse.json(
        { error: "Prova final não encontrada" },
        { status: 404 }
      );
    }

    // Para funcionários, remover informação de qual resposta está correta
    if (!isAdmin) {
      const sanitizedExam = {
        ...exam,
        questions: exam.questions.map((q) => ({
          ...q,
          answers: q.answers.map((a) => ({
            id: a.id,
            answer: a.answer,
            questionId: a.questionId,
          })),
        })),
        passed: exam.attempts.length > 0 && exam.attempts[0].passed,
        lastAttempt: exam.attempts[0] || null,
        bestScore: exam.attempts.length > 0
          ? Math.max(...exam.attempts.map((a) => a.score))
          : null,
      };
      return NextResponse.json(sanitizedExam);
    }

    return NextResponse.json(exam);
  } catch (error) {
    console.error("Erro ao buscar prova final:", error);
    return NextResponse.json(
      { error: "Erro ao buscar prova final" },
      { status: 500 }
    );
  }
}

// POST - Criar/Atualizar prova final (Admin)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ treinamentoId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { treinamentoId } = await params;
    const body = await req.json();
    const { title, description, passingScore, questions } = body;

    if (!title || !questions || questions.length === 0) {
      return NextResponse.json(
        { error: "Título e questões são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o treinamento existe
    const training = await prisma.training.findUnique({
      where: { id: treinamentoId },
    });

    if (!training) {
      return NextResponse.json(
        { error: "Treinamento não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se já existe prova final e deletar
    const existingExam = await prisma.trainingFinalExam.findUnique({
      where: { trainingId: treinamentoId },
    });

    if (existingExam) {
      await prisma.trainingFinalExam.delete({
        where: { id: existingExam.id },
      });
    }

    // Criar nova prova final
    const exam = await prisma.trainingFinalExam.create({
      data: {
        title,
        description,
        trainingId: treinamentoId,
        passingScore: passingScore || 70,
        questions: {
          create: questions.map((q: { question: string; answers: { answer: string; isCorrect: boolean }[] }, index: number) => ({
            question: q.question,
            order: index + 1,
            answers: {
              create: q.answers.map((a: { answer: string; isCorrect: boolean }) => ({
                answer: a.answer,
                isCorrect: a.isCorrect,
              })),
            },
          })),
        },
      },
      include: {
        questions: {
          orderBy: { order: "asc" },
          include: {
            answers: true,
          },
        },
      },
    });

    return NextResponse.json(exam, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar prova final:", error);
    return NextResponse.json(
      { error: "Erro ao criar prova final" },
      { status: 500 }
    );
  }
}

// DELETE - Deletar prova final (Admin)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ treinamentoId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { treinamentoId } = await params;

    await prisma.trainingFinalExam.delete({
      where: { trainingId: treinamentoId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar prova final:", error);
    return NextResponse.json(
      { error: "Erro ao deletar prova final" },
      { status: 500 }
    );
  }
}
