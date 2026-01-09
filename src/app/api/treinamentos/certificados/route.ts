import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Listar certificados de treinamento do funcionário
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const certificates = await prisma.trainingCertificate.findMany({
      where: { userId: session.user.id },
      include: {
        training: {
          include: {
            company: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { issueDate: "desc" },
    });

    return NextResponse.json(certificates);
  } catch (error) {
    console.error("Erro ao listar certificados:", error);
    return NextResponse.json(
      { error: "Erro ao listar certificados" },
      { status: 500 }
    );
  }
}
