import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ couponId: string }>;
}

// GET - Buscar cupom específico
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { couponId } = await params;

    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
      include: {
        courses: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        usages: {
          select: {
            id: true,
            userId: true,
            usedAt: true,
          },
        },
        _count: {
          select: {
            usages: true,
          },
        },
      },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: "Cupom não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(coupon);
  } catch (error) {
    console.error("Erro ao buscar cupom:", error);
    return NextResponse.json(
      { error: "Erro ao buscar cupom" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar cupom
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { couponId } = await params;
    const data = await request.json();

    const {
      code,
      description,
      discountType,
      discountValue,
      maxUses,
      minPurchase,
      validFrom,
      validUntil,
      courseIds,
      appliesToAll,
      isActive,
    } = data;

    // Verificar se o cupom existe
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id: couponId },
    });

    if (!existingCoupon) {
      return NextResponse.json(
        { error: "Cupom não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o código já existe em outro cupom
    if (code && code.toUpperCase() !== existingCoupon.code) {
      const codeExists = await prisma.coupon.findUnique({
        where: { code: code.toUpperCase() },
      });

      if (codeExists) {
        return NextResponse.json(
          { error: "Já existe um cupom com este código" },
          { status: 400 }
        );
      }
    }

    // Atualizar cupom
    const coupon = await prisma.coupon.update({
      where: { id: couponId },
      data: {
        code: code ? code.toUpperCase() : undefined,
        description: description !== undefined ? description : undefined,
        discountType: discountType || undefined,
        discountValue: discountValue !== undefined ? parseFloat(discountValue) : undefined,
        maxUses: maxUses !== undefined ? (maxUses ? parseInt(maxUses) : null) : undefined,
        minPurchase: minPurchase !== undefined ? (minPurchase ? parseFloat(minPurchase) : null) : undefined,
        validFrom: validFrom ? new Date(validFrom) : undefined,
        validUntil: validUntil !== undefined ? (validUntil ? new Date(validUntil) : null) : undefined,
        appliesToAll: appliesToAll !== undefined ? appliesToAll : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    });

    // Se courseIds foi fornecido, atualizar a relação
    if (courseIds !== undefined) {
      // Remover todos os cursos antigos
      await prisma.couponCourse.deleteMany({
        where: { couponId },
      });

      // Adicionar novos cursos (se não for para todos)
      if (appliesToAll === false && courseIds.length > 0) {
        await prisma.couponCourse.createMany({
          data: courseIds.map((courseId: string) => ({
            couponId,
            courseId,
          })),
        });
      }
    }

    // Buscar cupom atualizado com relações
    const updatedCoupon = await prisma.coupon.findUnique({
      where: { id: couponId },
      include: {
        courses: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedCoupon);
  } catch (error) {
    console.error("Erro ao atualizar cupom:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar cupom" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir cupom
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { couponId } = await params;

    // Verificar se o cupom existe
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id: couponId },
    });

    if (!existingCoupon) {
      return NextResponse.json(
        { error: "Cupom não encontrado" },
        { status: 404 }
      );
    }

    // Excluir cupom (CouponCourse e CouponUsage serão excluídos em cascata)
    await prisma.coupon.delete({
      where: { id: couponId },
    });

    return NextResponse.json({ message: "Cupom excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir cupom:", error);
    return NextResponse.json(
      { error: "Erro ao excluir cupom" },
      { status: 500 }
    );
  }
}
