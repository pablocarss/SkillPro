import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Listar quizzes de uma aula de treinamento
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { lessonId } = await params;

    // Verificar se a aula existe e pertence a um treinamento que o usuário tem acesso
    const lesson = await prisma.trainingLesson.findUnique({
      where: { id: lessonId },
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
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Aula não encontrada" },
        { status: 404 }
      );
    }

    // Verificar se é admin ou funcionário matriculado
    const isAdmin = session.user.role === "ADMIN";
    const isEnrolled = lesson.module.training.enrollments.length > 0;

    if (!isAdmin && !isEnrolled) {
      return NextResponse.json(
        { error: "Você não tem acesso a esta aula" },
        { status: 403 }
      );
    }

    // Buscar quizzes da aula
    const quizzes = await prisma.trainingQuiz.findMany({
      where: { lessonId },
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
          take: 1,
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Mapear para incluir se o usuário já passou no quiz
    const quizzesWithStatus = quizzes.map((quiz) => ({
      ...quiz,
      passed: quiz.attempts.length > 0 && quiz.attempts[0].passed,
      lastAttempt: quiz.attempts[0] || null,
    }));

    return NextResponse.json(quizzesWithStatus);
  } catch (error) {
    console.error("Erro ao buscar quizzes:", error);
    return NextResponse.json(
      { error: "Erro ao buscar quizzes" },
      { status: 500 }
    );
  }
}

// POST - Criar quiz em uma aula de treinamento (Admin)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { lessonId } = await params;
    const body = await req.json();
    const { title, description, passingScore, questions } = body;

    if (!title || !questions || questions.length === 0) {
      return NextResponse.json(
        { error: "Título e questões são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se a aula existe
    const lesson = await prisma.trainingLesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Aula não encontrada" },
        { status: 404 }
      );
    }

    // Criar quiz com questões e respostas
    const quiz = await prisma.trainingQuiz.create({
      data: {
        title,
        description,
        lessonId,
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

    return NextResponse.json(quiz, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar quiz:", error);
    return NextResponse.json(
      { error: "Erro ao criar quiz" },
      { status: 500 }
    );
  }
}
