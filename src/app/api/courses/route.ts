import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
        modules: {
          include: {
            lessons: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            modules: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calcular total de lessons de todos os módulos
    const coursesWithLessonCount = courses.map(course => ({
      ...course,
      _count: {
        ...course._count,
        lessons: course.modules.reduce((total, module) => total + module.lessons.length, 0),
      },
    }));

    return NextResponse.json(coursesWithLessonCount);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, level, duration, passingScore, certificateTemplateId, price } = body;

    const course = await prisma.course.create({
      data: {
        title,
        description,
        level,
        duration,
        passingScore: parseInt(passingScore),
        createdById: session.user.id,
        isPublished: true,
        certificateTemplateId: certificateTemplateId && certificateTemplateId !== "NONE" ? certificateTemplateId : null,
        price: price !== null && price !== undefined ? parseFloat(price) : null,
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
  }
}
