import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAbacatePayClient, getAppUrl } from "@/lib/abacatepay";

// Métodos de pagamento suportados pelo AbacatePay
type PaymentMethod = "PIX" | "CARD";

/**
 * POST /api/payments/abacatepay
 * Cria uma sessão de pagamento no AbacatePay
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { courseId, couponCode, paymentMethod } = body;

    // Método de pagamento selecionado (padrão: PIX)
    const methods: PaymentMethod[] = paymentMethod ? [paymentMethod] : ["PIX"];

    if (!courseId) {
      return NextResponse.json(
        { error: "ID do curso é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar o curso
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Curso não encontrado" },
        { status: 404 }
      );
    }

    if (!course.price || course.price <= 0) {
      return NextResponse.json(
        { error: "Este curso é gratuito" },
        { status: 400 }
      );
    }

    // Verificar se já está inscrito
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: session.user.id,
        courseId: courseId,
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Você já está inscrito neste curso" },
        { status: 400 }
      );
    }

    // Calcular preço com cupom (se houver)
    // course.price está em reais (ex: 49.90)
    let finalPriceReais = course.price;
    let appliedCoupon = null;

    if (couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: {
          code: couponCode.toUpperCase(),
          isActive: true,
          OR: [
            { validUntil: null },
            { validUntil: { gte: new Date() } },
          ],
        },
        include: {
          courses: {
            select: {
              courseId: true,
            },
          },
        },
      });

      if (coupon) {
        // Verificar se o cupom é válido para este curso
        let isValidForCourse = coupon.appliesToAll;
        if (!isValidForCourse) {
          const allowedCourseIds = coupon.courses.map((c) => c.courseId);
          isValidForCourse = allowedCourseIds.includes(courseId);
        }

        // Verificar limite de uso e se é válido para o curso
        if (isValidForCourse && (!coupon.maxUses || coupon.usedCount < coupon.maxUses)) {
          if (coupon.discountType === "PERCENTAGE") {
            finalPriceReais = course.price * (1 - coupon.discountValue / 100);
          } else {
            // Desconto fixo em reais
            finalPriceReais = Math.max(0, course.price - coupon.discountValue);
          }
          appliedCoupon = coupon;
        }
      }
    }

    // Converter para centavos (AbacatePay usa centavos)
    let finalPriceCentavos = Math.round(finalPriceReais * 100);

    // Preço mínimo de 100 centavos (R$ 1,00)
    if (finalPriceCentavos < 100) {
      finalPriceCentavos = 100;
    }

    const appUrl = getAppUrl();
    const abacatePay = getAbacatePayClient();

    // Buscar dados do usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Validar CPF do usuário
    if (!user.cpf) {
      return NextResponse.json(
        { error: "Por favor, cadastre seu CPF no perfil antes de realizar a compra" },
        { status: 400 }
      );
    }

    // Validar telefone do usuário
    if (!user.phone) {
      return NextResponse.json(
        { error: "Por favor, cadastre seu telefone no perfil antes de realizar a compra" },
        { status: 400 }
      );
    }

    // Criar cobrança no AbacatePay
    const response = await abacatePay.createBilling({
      frequency: "ONE_TIME",
      methods: methods,
      products: [
        {
          externalId: course.id,
          name: course.title,
          description: course.description || `Curso: ${course.title}`,
          quantity: 1,
          price: finalPriceCentavos,
        },
      ],
      returnUrl: `${appUrl}/dashboard/catalog`,
      completionUrl: `${appUrl}/dashboard/courses?payment=success&courseId=${course.id}`,
      customer: {
        name: user.name,
        email: user.email,
        cellphone: user.phone.replace(/\D/g, ""), // Remove formatação
        taxId: user.cpf.replace(/\D/g, ""), // Remove formatação
      },
      externalId: `enrollment_${session.user.id}_${course.id}_${Date.now()}`,
      metadata: {
        userId: session.user.id,
        courseId: course.id,
        couponId: appliedCoupon?.id || null,
        originalPriceCentavos: Math.round(course.price * 100),
        finalPriceCentavos: finalPriceCentavos,
      },
    });

    if (response.error || !response.data) {
      console.error("Erro AbacatePay:", response.error);

      // Tratar erros específicos
      if (response.error?.includes("taxId")) {
        return NextResponse.json(
          { error: "CPF inválido. Por favor, verifique seu CPF no perfil." },
          { status: 400 }
        );
      }
      if (response.error?.includes("cellphone")) {
        return NextResponse.json(
          { error: "Telefone inválido. Por favor, verifique seu telefone no perfil." },
          { status: 400 }
        );
      }
      if (response.error?.includes("Cartão") || response.error?.includes("CARD")) {
        return NextResponse.json(
          { error: "Pagamento com cartão não está disponível no momento. Por favor, utilize o PIX." },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: response.error || "Erro ao criar pagamento" },
        { status: 500 }
      );
    }

    // NÃO criar inscrição aqui - será criada pelo webhook após pagamento confirmado
    // Apenas retornar a URL de pagamento

    return NextResponse.json({
      success: true,
      paymentUrl: response.data.url,
      billingId: response.data.id,
      amount: response.data.amount,
    });
  } catch (error) {
    console.error("Erro ao criar pagamento:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro interno do servidor";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
