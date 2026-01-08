import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const { courseId } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { error: "ID do curso não fornecido" },
        { status: 400 }
      );
    }

    // Buscar curso e validar
    const course = await prisma.course.findUnique({
      where: { id: courseId, isPublished: true },
      select: { id: true, title: true, description: true, price: true }
    });

    if (!course) {
      return NextResponse.json(
        { error: "Curso não encontrado" },
        { status: 404 }
      );
    }

    if (!course.price || course.price <= 0) {
      return NextResponse.json(
        { error: "Este curso é gratuito. Use a inscrição direta." },
        { status: 400 }
      );
    }

    // Verificar se já existe enrollment
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        courseId: course.id,
        studentId: session.user.id,
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Você já está inscrito neste curso" },
        { status: 400 }
      );
    }

    // Criar enrollment PENDING
    const enrollment = await prisma.enrollment.create({
      data: {
        courseId: course.id,
        studentId: session.user.id,
        status: "PENDING",
      },
    });

    // Criar registro de Payment PENDING
    const payment = await prisma.payment.create({
      data: {
        enrollmentId: enrollment.id,
        amount: course.price,
        currency: "BRL",
        status: "PENDING",
      },
    });

    // Criar Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: course.title,
              description: course.description || undefined,
            },
            unit_amount: Math.round(course.price * 100), // Converter para centavos
          },
          quantity: 1,
        },
      ],
      customer_email: session.user.email || undefined,
      metadata: {
        enrollmentId: enrollment.id,
        courseId: course.id,
        studentId: session.user.id,
      },
      success_url: `${process.env.NEXT_PUBLIC_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/checkout/cancel?course_id=${course.id}`,
    });

    // Atualizar Payment com stripeSessionId
    await prisma.payment.update({
      where: { id: payment.id },
      data: { stripeSessionId: checkoutSession.id },
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error("Erro ao criar checkout session:", error);
    return NextResponse.json(
      { error: "Erro ao processar pagamento" },
      { status: 500 }
    );
  }
}
