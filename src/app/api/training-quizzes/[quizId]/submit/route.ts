import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST - Submeter respostas do quiz
export async function POST(
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
    const body = await req.json();
    const { answers } = body; // { [questionId]: answerId }

    if (!answers || Object.keys(answers).length === 0) {
      return NextResponse.json(
        { error: "Respostas são obrigatórias" },
        { status: 400 }
      );
    }

    // Buscar quiz com questões e respostas corretas
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
          include: {
            answers: true,
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o usuário está matriculado
    const isEnrolled = quiz.lesson.module.training.enrollments.length > 0;
    if (!isEnrolled) {
      return NextResponse.json(
        { error: "Você não está matriculado neste treinamento" },
        { status: 403 }
      );
    }

    // Calcular pontuação
    let correctAnswers = 0;
    const totalQuestions = quiz.questions.length;
    const results: { questionId: string; correct: boolean; correctAnswerId: string }[] = [];

    quiz.questions.forEach((question) => {
      const userAnswer = answers[question.id];
      const correctAnswer = question.answers.find((a) => a.isCorrect);

      const isCorrect = userAnswer === correctAnswer?.id;
      if (isCorrect) {
        correctAnswers++;
      }

      results.push({
        questionId: question.id,
        correct: isCorrect,
        correctAnswerId: correctAnswer?.id || "",
      });
    });

    const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const passed = score >= quiz.passingScore;

    // Salvar tentativa
    const attempt = await prisma.trainingQuizAttempt.create({
      data: {
        userId: session.user.id,
        quizId,
        score,
        answers,
        passed,
      },
    });

    return NextResponse.json({
      attempt,
      score,
      passed,
      correctAnswers,
      totalQuestions,
      passingScore: quiz.passingScore,
      results,
    });
  } catch (error) {
    console.error("Erro ao submeter quiz:", error);
    return NextResponse.json(
      { error: "Erro ao submeter quiz" },
      { status: 500 }
    );
  }
}
