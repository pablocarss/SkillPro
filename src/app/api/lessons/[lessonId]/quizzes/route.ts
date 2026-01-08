import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
  try {
    const { lessonId } = await params;
    const quizzes = await prisma.quiz.findMany({
      where: { lessonId },
      include: {
        questions: {
          include: {
            answers: true,
          },
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json(quizzes);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch quizzes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lessonId } = await params;
    const body = await request.json();
    const { title, description, passingScore, questions } = body;

    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        passingScore: parseInt(passingScore),
        lessonId,
        questions: {
          create: questions.map((q: any, index: number) => ({
            question: q.question,
            order: index + 1,
            answers: {
              create: q.answers.map((a: any) => ({
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
    console.error("Error creating quiz:", error);
    return NextResponse.json({ error: "Failed to create quiz" }, { status: 500 });
  }
}
