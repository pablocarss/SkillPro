import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Buscar treinamento específico
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ treinamentoId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { treinamentoId } = await params;

    const training = await prisma.training.findUnique({
      where: { id: treinamentoId },
      include: {
        company: true,
        trainingCompanies: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                cnpj: true,
                _count: {
                  select: {
                    users: {
                      where: { role: "EMPLOYEE" }
                    }
                  }
                }
              }
            }
          }
        },
        certificateTemplates: {
          include: {
            company: {
              select: { id: true, name: true }
            }
          }
        },
        createdBy: {
          select: {
            name: true,
          },
        },
        modules: {
          include: {
            lessons: {
              include: {
                quizzes: true,
              },
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
        enrollments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                companyId: true,
                company: {
                  select: { id: true, name: true }
                }
              },
            },
          },
        },
        finalExam: {
          include: {
            questions: {
              include: {
                answers: true,
              },
              orderBy: { order: "asc" },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
            modules: true,
            certificates: true,
            trainingCompanies: true,
          },
        },
      },
    });

    if (!training) {
      return NextResponse.json(
        { error: "Treinamento não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(training);
  } catch (error) {
    console.error("Erro ao buscar treinamento:", error);
    return NextResponse.json(
      { error: "Erro ao buscar treinamento" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar treinamento
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ treinamentoId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { treinamentoId } = await params;
    const data = await req.json();

    const { title, description, level, duration, passingScore, isPublished, companyId, thumbnail } = data;

    // Verificar se existe
    const existingTraining = await prisma.training.findUnique({
      where: { id: treinamentoId },
    });

    if (!existingTraining) {
      return NextResponse.json(
        { error: "Treinamento não encontrado" },
        { status: 404 }
      );
    }

    const training = await prisma.training.update({
      where: { id: treinamentoId },
      data: {
        title: title || existingTraining.title,
        description: description || existingTraining.description,
        level: level || existingTraining.level,
        duration: duration !== undefined ? duration : existingTraining.duration,
        passingScore: passingScore !== undefined ? parseInt(passingScore) : existingTraining.passingScore,
        isPublished: isPublished !== undefined ? isPublished : existingTraining.isPublished,
        companyId: companyId || existingTraining.companyId,
        thumbnail: thumbnail !== undefined ? thumbnail : existingTraining.thumbnail,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(training);
  } catch (error) {
    console.error("Erro ao atualizar treinamento:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar treinamento" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir treinamento
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ treinamentoId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { treinamentoId } = await params;

    await prisma.training.delete({
      where: { id: treinamentoId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir treinamento:", error);
    return NextResponse.json(
      { error: "Erro ao excluir treinamento" },
      { status: 500 }
    );
  }
}
