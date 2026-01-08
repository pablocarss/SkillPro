import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  try {
    const { courseId } = await params;
    const finalExam = await prisma.finalExam.findUnique({
      where: { courseId },
      include: {
        questions: {
          include: {
            answers: true,
          },
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json(finalExam);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch final exam" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await params;
    const body = await request.json();
    const { title, description, passingScore, questions } = body;

    // Delete existing exam if any
    await prisma.finalExam.deleteMany({
      where: { courseId },
    });

    const finalExam = await prisma.finalExam.create({
      data: {
        title,
        description,
        passingScore: parseInt(passingScore),
        courseId,
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

    return NextResponse.json(finalExam, { status: 201 });
  } catch (error) {
    console.error("Error creating final exam:", error);
    return NextResponse.json({ error: "Failed to create final exam" }, { status: 500 });
  }
}
