import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Listar todos os treinamentos
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    // Filtrar por empresa vinculada (trainingCompanies) ou empresa legacy (companyId)
    const whereClause = companyId
      ? {
          OR: [
            { companyId },
            { trainingCompanies: { some: { companyId } } }
          ]
        }
      : {};

    const trainings = await prisma.training.findMany({
      where: whereClause,
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        trainingCompanies: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        createdBy: {
          select: {
            name: true,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(trainings);
  } catch (error) {
    console.error("Erro ao listar treinamentos:", error);
    return NextResponse.json(
      { error: "Erro ao listar treinamentos" },
      { status: 500 }
    );
  }
}

// POST - Criar novo treinamento
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const data = await req.json();

    const { title, description, level, duration, passingScore, companyId, companyIds } = data;

    // Validações - companyId agora é opcional
    if (!title || !description) {
      return NextResponse.json(
        { error: "Título e descrição são obrigatórios" },
        { status: 400 }
      );
    }

    // Se companyId fornecido (modo legado), verificar se existe
    if (companyId) {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
      });

      if (!company) {
        return NextResponse.json(
          { error: "Empresa não encontrada" },
          { status: 404 }
        );
      }
    }

    // Criar treinamento
    const training = await prisma.training.create({
      data: {
        title,
        description,
        level: level || "Básico",
        duration: duration || "",
        passingScore: passingScore ? parseInt(passingScore) : 70,
        companyId: companyId || null, // Opcional agora
        createdById: session.user.id,
        isPublished: false,
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

    // Se companyIds fornecido, vincular múltiplas empresas
    if (companyIds && Array.isArray(companyIds) && companyIds.length > 0) {
      await prisma.trainingCompany.createMany({
        data: companyIds.map((cId: string) => ({
          trainingId: training.id,
          companyId: cId,
        })),
        skipDuplicates: true,
      });
    }

    // Buscar treinamento com empresas vinculadas
    const trainingWithCompanies = await prisma.training.findUnique({
      where: { id: training.id },
      include: {
        company: {
          select: { id: true, name: true },
        },
        trainingCompanies: {
          include: {
            company: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    return NextResponse.json(trainingWithCompanies, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar treinamento:", error);
    return NextResponse.json(
      { error: "Erro ao criar treinamento" },
      { status: 500 }
    );
  }
}
