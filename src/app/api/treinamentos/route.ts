import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Listar treinamentos do funcionário logado
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Buscar matrículas do usuário
    const enrollments = await prisma.trainingEnrollment.findMany({
      where: { userId: session.user.id },
      include: {
        training: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
              },
            },
            modules: {
              include: {
                lessons: {
                  select: { id: true },
                },
              },
            },
            _count: {
              select: {
                modules: true,
              },
            },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    // Buscar progresso de cada treinamento
    const trainingsWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        const totalLessons = enrollment.training.modules.reduce(
          (acc, m) => acc + m.lessons.length,
          0
        );

        const completedLessons = await prisma.trainingLessonProgress.count({
          where: {
            userlId: session.user.id,
            lesson: {
              module: {
                trainingId: enrollment.training.id,
              },
            },
            completed: true,
          },
        });

        // Verificar se tem certificado
        const certificate = await prisma.trainingCertificate.findUnique({
          where: {
            userId_trainingId: {
              userId: session.user.id,
              trainingId: enrollment.training.id,
            },
          },
        });

        return {
          id: enrollment.id,
          enrolledAt: enrollment.enrolledAt,
          completedAt: enrollment.completedAt,
          training: {
            id: enrollment.training.id,
            title: enrollment.training.title,
            description: enrollment.training.description,
            level: enrollment.training.level,
            duration: enrollment.training.duration,
            thumbnail: enrollment.training.thumbnail,
            company: enrollment.training.company,
            modulesCount: enrollment.training._count.modules,
          },
          progress: {
            total: totalLessons,
            completed: completedLessons,
            percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
          },
          hasCertificate: !!certificate,
          certificateId: certificate?.id,
        };
      })
    );

    return NextResponse.json(trainingsWithProgress);
  } catch (error) {
    console.error("Erro ao listar treinamentos:", error);
    return NextResponse.json(
      { error: "Erro ao listar treinamentos" },
      { status: 500 }
    );
  }
}
