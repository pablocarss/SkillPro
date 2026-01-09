import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Listar empresas vinculadas ao treinamento
export async function GET(
  request: NextRequest,
  { params }: { params: { treinamentoId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { treinamentoId } = params;

    // Buscar empresas vinculadas ao treinamento
    const trainingCompanies = await prisma.trainingCompany.findMany({
      where: { trainingId: treinamentoId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            cnpj: true,
            email: true,
            isActive: true,
            _count: {
              select: {
                users: {
                  where: { role: "EMPLOYEE" }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // Buscar também todas as empresas disponíveis para vincular
    const allCompanies = await prisma.company.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        cnpj: true,
        email: true,
        _count: {
          select: {
            users: {
              where: { role: "EMPLOYEE" }
            }
          }
        }
      },
      orderBy: {
        name: "asc"
      }
    });

    // IDs das empresas já vinculadas
    const linkedCompanyIds = trainingCompanies.map(tc => tc.companyId);

    return NextResponse.json({
      linkedCompanies: trainingCompanies.map(tc => ({
        id: tc.id,
        linkedAt: tc.createdAt,
        company: tc.company
      })),
      availableCompanies: allCompanies.filter(c => !linkedCompanyIds.includes(c.id))
    });
  } catch (error) {
    console.error("Erro ao buscar empresas do treinamento:", error);
    return NextResponse.json(
      { error: "Erro ao buscar empresas" },
      { status: 500 }
    );
  }
}

// POST - Vincular empresa(s) ao treinamento
export async function POST(
  request: NextRequest,
  { params }: { params: { treinamentoId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { treinamentoId } = params;
    const body = await request.json();
    const { companyIds } = body;

    if (!companyIds || !Array.isArray(companyIds) || companyIds.length === 0) {
      return NextResponse.json(
        { error: "IDs das empresas são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o treinamento existe
    const training = await prisma.training.findUnique({
      where: { id: treinamentoId }
    });

    if (!training) {
      return NextResponse.json(
        { error: "Treinamento não encontrado" },
        { status: 404 }
      );
    }

    // Vincular cada empresa (ignora duplicatas)
    const results = await Promise.allSettled(
      companyIds.map(companyId =>
        prisma.trainingCompany.create({
          data: {
            trainingId: treinamentoId,
            companyId
          },
          include: {
            company: {
              select: {
                id: true,
                name: true,
                cnpj: true
              }
            }
          }
        })
      )
    );

    const created = results
      .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled")
      .map(r => r.value);

    const errors = results
      .filter((r): r is PromiseRejectedResult => r.status === "rejected")
      .length;

    return NextResponse.json({
      message: `${created.length} empresa(s) vinculada(s) com sucesso`,
      linked: created,
      duplicates: errors
    });
  } catch (error) {
    console.error("Erro ao vincular empresas:", error);
    return NextResponse.json(
      { error: "Erro ao vincular empresas" },
      { status: 500 }
    );
  }
}

// DELETE - Desvincular empresa do treinamento
export async function DELETE(
  request: NextRequest,
  { params }: { params: { treinamentoId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { treinamentoId } = params;
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json(
        { error: "ID da empresa é obrigatório" },
        { status: 400 }
      );
    }

    // Remover vínculo
    await prisma.trainingCompany.delete({
      where: {
        trainingId_companyId: {
          trainingId: treinamentoId,
          companyId
        }
      }
    });

    return NextResponse.json({ message: "Empresa desvinculada com sucesso" });
  } catch (error) {
    console.error("Erro ao desvincular empresa:", error);
    return NextResponse.json(
      { error: "Erro ao desvincular empresa" },
      { status: 500 }
    );
  }
}
