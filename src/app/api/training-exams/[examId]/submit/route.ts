import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateTrainingCertificate } from "@/lib/training-certificate-generator";

// POST - Submeter prova final
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { examId } = await params;
    const body = await req.json();
    const { answers } = body; // { [questionId]: answerId }

    if (!answers || Object.keys(answers).length === 0) {
      return NextResponse.json(
        { error: "Respostas são obrigatórias" },
        { status: 400 }
      );
    }

    // Buscar prova com questões e respostas corretas
    const exam = await prisma.trainingFinalExam.findUnique({
      where: { id: examId },
      include: {
        training: {
          include: {
            enrollments: {
              where: { userId: session.user.id },
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

    if (!exam) {
      return NextResponse.json(
        { error: "Prova não encontrada" },
        { status: 404 }
      );
    }

    // Verificar se o usuário está matriculado
    const isEnrolled = exam.training.enrollments.length > 0;
    if (!isEnrolled) {
      return NextResponse.json(
        { error: "Você não está matriculado neste treinamento" },
        { status: 403 }
      );
    }

    // Verificar se o usuário completou todas as aulas
    const training = await prisma.training.findUnique({
      where: { id: exam.trainingId },
      include: {
        modules: {
          include: {
            lessons: {
              include: {
                progress: {
                  where: { userlId: session.user.id },
                },
              },
            },
          },
        },
      },
    });

    if (training) {
      const totalLessons = training.modules.reduce(
        (acc, module) => acc + module.lessons.length,
        0
      );
      const completedLessons = training.modules.reduce(
        (acc, module) =>
          acc +
          module.lessons.filter(
            (lesson) =>
              lesson.progress.length > 0 && lesson.progress[0].completed
          ).length,
        0
      );

      if (completedLessons < totalLessons) {
        return NextResponse.json(
          {
            error: "Você precisa completar todas as aulas antes de fazer a prova",
            completedLessons,
            totalLessons,
          },
          { status: 400 }
        );
      }
    }

    // Calcular pontuação
    let correctAnswers = 0;
    const totalQuestions = exam.questions.length;
    const results: { questionId: string; correct: boolean; correctAnswerId: string }[] = [];

    exam.questions.forEach((question) => {
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
    const passed = score >= exam.passingScore;

    // Salvar tentativa
    const attempt = await prisma.trainingExamAttempt.create({
      data: {
        userId: session.user.id,
        examId,
        score,
        answers,
        passed,
      },
    });

    // Gerar certificado se passou
    let certificate = null;
    if (passed) {
      try {
        const certResult = await generateTrainingCertificate({
          userId: session.user.id,
          trainingId: exam.trainingId,
          createdById: session.user.id,
        });

        if (certResult.success) {
          certificate = certResult.certificate;
        }
      } catch (certError) {
        console.error("Erro ao gerar certificado:", certError);
        // Não retorna erro, pois a prova foi concluída com sucesso
      }
    }

    return NextResponse.json({
      attempt,
      score,
      passed,
      correctAnswers,
      totalQuestions,
      passingScore: exam.passingScore,
      results,
      certificate,
    });
  } catch (error) {
    console.error("Erro ao submeter prova:", error);
    return NextResponse.json(
      { error: "Erro ao submeter prova" },
      { status: 500 }
    );
  }
}
