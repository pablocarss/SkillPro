import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  try {
    const { courseId } = await params;
    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      include: {
        quizzes: {
          include: {
            _count: {
              select: { questions: true },
            },
          },
        },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(lessons);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch lessons" }, { status: 500 });
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
    const { title, description, content, videoUrl, order } = body;

    const lesson = await prisma.lesson.create({
      data: {
        title,
        description,
        content,
        videoUrl,
        order: parseInt(order),
        courseId,
      },
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create lesson" }, { status: 500 });
  }
}
