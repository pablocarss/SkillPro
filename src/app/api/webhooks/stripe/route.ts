import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get("stripe-signature");

  if (!signature) {
    console.error("Stripe signature missing");
    return NextResponse.json(
      { error: "Stripe signature missing" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    // Verificar assinatura do webhook
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json(
      { error: `Webhook Error: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 400 }
    );
  }

  console.log("Stripe webhook event received:", event.type);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionExpired(session);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const enrollmentId = session.metadata?.enrollmentId;

  if (!enrollmentId) {
    console.error("Enrollment ID not found in session metadata");
    return;
  }

  console.log(`Processing completed checkout for enrollment: ${enrollmentId}`);

  try {
    // Usar transação para garantir atomicidade
    await prisma.$transaction(async (tx) => {
      // Atualizar Payment
      await tx.payment.update({
        where: { enrollmentId },
        data: {
          status: "COMPLETED",
          stripePaymentId: session.payment_intent as string,
          paidAt: new Date(),
        },
      });

      // Atualizar Enrollment para APPROVED
      await tx.enrollment.update({
        where: { id: enrollmentId },
        data: { status: "APPROVED" },
      });
    });

    console.log(`Successfully processed payment for enrollment: ${enrollmentId}`);
  } catch (error) {
    console.error("Error updating payment and enrollment:", error);
    throw error;
  }
}

async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session) {
  const enrollmentId = session.metadata?.enrollmentId;

  if (!enrollmentId) {
    console.error("Enrollment ID not found in session metadata");
    return;
  }

  console.log(`Processing expired checkout for enrollment: ${enrollmentId}`);

  try {
    // Atualizar Payment para FAILED
    await prisma.payment.update({
      where: { enrollmentId },
      data: { status: "FAILED" },
    });

    // Opcional: deletar enrollment ou manter como PENDING
    // Por enquanto, apenas mantemos o enrollment como PENDING
    console.log(`Marked payment as FAILED for enrollment: ${enrollmentId}`);
  } catch (error) {
    console.error("Error handling expired session:", error);
    throw error;
  }
}
