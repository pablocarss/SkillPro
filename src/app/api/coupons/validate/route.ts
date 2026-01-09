import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { code, courseId, price } = await req.json();

    if (!code) {
      return NextResponse.json(
        { error: "Código do cupom é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar cupom
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: "Cupom não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se está ativo
    if (!coupon.isActive) {
      return NextResponse.json(
        { error: "Este cupom não está mais ativo" },
        { status: 400 }
      );
    }

    // Verificar validade
    const now = new Date();
    if (coupon.validFrom > now) {
      return NextResponse.json(
        { error: "Este cupom ainda não está válido" },
        { status: 400 }
      );
    }

    if (coupon.validUntil && coupon.validUntil < now) {
      return NextResponse.json(
        { error: "Este cupom expirou" },
        { status: 400 }
      );
    }

    // Verificar limite de uso
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json(
        { error: "Este cupom atingiu o limite de uso" },
        { status: 400 }
      );
    }

    // Verificar se é para curso específico
    if (coupon.courseId && coupon.courseId !== courseId) {
      return NextResponse.json(
        { error: "Este cupom não é válido para este curso" },
        { status: 400 }
      );
    }

    // Verificar valor mínimo de compra
    if (coupon.minPurchase && price < coupon.minPurchase) {
      return NextResponse.json(
        { error: `Valor mínimo para este cupom: R$ ${coupon.minPurchase.toFixed(2)}` },
        { status: 400 }
      );
    }

    // Verificar se o usuário já usou este cupom
    const existingUsage = await prisma.couponUsage.findFirst({
      where: {
        couponId: coupon.id,
        userId: session.user.id,
      },
    });

    if (existingUsage) {
      return NextResponse.json(
        { error: "Você já utilizou este cupom" },
        { status: 400 }
      );
    }

    // Cupom válido!
    return NextResponse.json({
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        description: coupon.description,
      },
    });
  } catch (error) {
    console.error("Erro ao validar cupom:", error);
    return NextResponse.json(
      { error: "Erro ao validar cupom" },
      { status: 500 }
    );
  }
}
