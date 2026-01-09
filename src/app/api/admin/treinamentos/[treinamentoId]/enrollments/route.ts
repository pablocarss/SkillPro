import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Listar matrículas do treinamento
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

    const enrollments = await prisma.trainingEnrollment.findMany({
      where: { trainingId: treinamentoId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    return NextResponse.json(enrollments);
  } catch (error) {
    console.error("Erro ao listar matrículas:", error);
    return NextResponse.json(
      { error: "Erro ao listar matrículas" },
      { status: 500 }
    );
  }
}

// POST - Matricular funcionário no treinamento
export async function POST(
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

    const { userId, userIds, companyId, enrollAll } = data;

    // Verificar se o treinamento existe
    const training = await prisma.training.findUnique({
      where: { id: treinamentoId },
      include: {
        trainingCompanies: true
      }
    });

    if (!training) {
      return NextResponse.json(
        { error: "Treinamento não encontrado" },
        { status: 404 }
      );
    }

    let usersToEnroll: string[] = [];

    // Se enrollAll=true e companyId fornecido, matricular todos da empresa
    if (enrollAll && companyId) {
      // Verificar se a empresa está vinculada ao treinamento
      const isLinked = training.trainingCompanies.some(tc => tc.companyId === companyId) ||
                       training.companyId === companyId;

      if (!isLinked) {
        return NextResponse.json(
          { error: "A empresa não está vinculada a este treinamento" },
          { status: 400 }
        );
      }

      // Buscar todos os funcionários da empresa
      const employees = await prisma.user.findMany({
        where: {
          companyId,
          role: "EMPLOYEE"
        },
        select: { id: true }
      });

      usersToEnroll = employees.map(e => e.id);
    } else {
      // Suporta matrícula única ou em lote
      usersToEnroll = userIds || (userId ? [userId] : []);
    }

    if (usersToEnroll.length === 0) {
      return NextResponse.json(
        { error: "É necessário informar pelo menos um funcionário ou usar enrollAll com companyId" },
        { status: 400 }
      );
    }

    // Criar matrículas (ignorar duplicatas)
    const enrollments = [];
    let duplicates = 0;

    for (const uid of usersToEnroll) {
      try {
        const enrollment = await prisma.trainingEnrollment.create({
          data: {
            userId: uid,
            trainingId: treinamentoId,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                company: {
                  select: { id: true, name: true }
                }
              },
            },
          },
        });
        enrollments.push(enrollment);
      } catch (error) {
        // Ignorar se já matriculado
        duplicates++;
      }
    }

    return NextResponse.json(
      {
        message: `${enrollments.length} funcionário(s) matriculado(s) com sucesso`,
        total: usersToEnroll.length,
        created: enrollments.length,
        duplicates,
        enrollments
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao matricular funcionário:", error);
    return NextResponse.json(
      { error: "Erro ao matricular funcionário" },
      { status: 500 }
    );
  }
}

// DELETE - Remover matrícula
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const enrollmentId = searchParams.get("enrollmentId");

    if (!enrollmentId) {
      return NextResponse.json(
        { error: "ID da matrícula é obrigatório" },
        { status: 400 }
      );
    }

    await prisma.trainingEnrollment.delete({
      where: { id: enrollmentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao remover matrícula:", error);
    return NextResponse.json(
      { error: "Erro ao remover matrícula" },
      { status: 500 }
    );
  }
}
