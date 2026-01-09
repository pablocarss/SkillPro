import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Listar todos os cupons
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const coupons = await prisma.coupon.findMany({
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            usages: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(coupons);
  } catch (error) {
    console.error("Erro ao listar cupons:", error);
    return NextResponse.json(
      { error: "Erro ao listar cupons" },
      { status: 500 }
    );
  }
}

// POST - Criar novo cupom
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

    const {
      code,
      description,
      discountType,
      discountValue,
      maxUses,
      minPurchase,
      validFrom,
      validUntil,
      courseId,
      isActive,
    } = data;

    // Validações
    if (!code || !discountValue) {
      return NextResponse.json(
        { error: "Código e valor do desconto são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o código já existe
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existingCoupon) {
      return NextResponse.json(
        { error: "Já existe um cupom com este código" },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        description,
        discountType: discountType || "PERCENTAGE",
        discountValue: parseFloat(discountValue),
        maxUses: maxUses ? parseInt(maxUses) : null,
        minPurchase: minPurchase ? parseFloat(minPurchase) : null,
        validFrom: validFrom ? new Date(validFrom) : new Date(),
        validUntil: validUntil ? new Date(validUntil) : null,
        courseId: courseId || null,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar cupom:", error);
    return NextResponse.json(
      { error: "Erro ao criar cupom" },
      { status: 500 }
    );
  }
}
