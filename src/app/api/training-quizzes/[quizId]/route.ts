import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Buscar quiz por ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { quizId } = await params;

    const quiz = await prisma.trainingQuiz.findUnique({
      where: { id: quizId },
      include: {
        lesson: {
          include: {
            module: {
              include: {
                training: {
                  include: {
                    enrollments: {
                      where: { userId: session.user.id },
                    },
                  },
                },
              },
            },
          },
        },
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

    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz não encontrado" },
        { status: 404 }
      );
    }

    // Verificar acesso
    const isAdmin = session.user.role === "ADMIN";
    const isEnrolled = quiz.lesson.module.training.enrollments.length > 0;

    if (!isAdmin && !isEnrolled) {
      return NextResponse.json(
        { error: "Você não tem acesso a este quiz" },
        { status: 403 }
      );
    }

    // Para funcionários, remover informação de qual resposta está correta
    if (!isAdmin) {
      const sanitizedQuiz = {
        ...quiz,
        questions: quiz.questions.map((q) => ({
          ...q,
          answers: q.answers.map((a) => ({
            id: a.id,
            answer: a.answer,
            questionId: a.questionId,
          })),
        })),
        passed: quiz.attempts.length > 0 && quiz.attempts[0].passed,
        lastAttempt: quiz.attempts[0] || null,
      };
      return NextResponse.json(sanitizedQuiz);
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("Erro ao buscar quiz:", error);
    return NextResponse.json(
      { error: "Erro ao buscar quiz" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar quiz (Admin)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { quizId } = await params;
    const body = await req.json();
    const { title, description, passingScore, questions } = body;

    // Deletar questões antigas e criar novas
    await prisma.trainingQuizQuestion.deleteMany({
      where: { quizId },
    });

    const quiz = await prisma.trainingQuiz.update({
      where: { id: quizId },
      data: {
        title,
        description,
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
          include: {
            answers: true,
          },
        },
      },
    });

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("Erro ao atualizar quiz:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar quiz" },
      { status: 500 }
    );
  }
}

// DELETE - Deletar quiz (Admin)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { quizId } = await params;

    await prisma.trainingQuiz.delete({
      where: { id: quizId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar quiz:", error);
    return NextResponse.json(
      { error: "Erro ao deletar quiz" },
      { status: 500 }
    );
  }
}
