import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateWebhookSecret } from "@/lib/abacatepay";

interface BillingPaidEvent {
  billing: {
    id: string;
    status: string;
    amount: number;
    devMode: boolean;
    fee: number;
    paidAt: string;
    metadata?: {
      userId?: string;
      courseId?: string;
      couponId?: string;
      originalPrice?: number;
      finalPrice?: number;
    };
    customer?: {
      id: string;
      metadata: {
        name: string;
        email: string;
        cellphone?: string;
        taxId?: string;
      };
    };
    products: {
      id: string;
      externalId: string;
      quantity: number;
    }[];
  };
  payment: {
    id: string;
    amount: number;
    fee: number;
    method: string;
  };
}

interface WithdrawEvent {
  id: string;
  status: string;
  amount: number;
  platformFee: number;
  receiptUrl?: string;
}

type WebhookEvent =
  | { event: "billing.paid"; data: BillingPaidEvent }
  | { event: "withdraw.done"; data: WithdrawEvent }
  | { event: "withdraw.failed"; data: WithdrawEvent };

/**
 * POST /api/webhooks/abacatepay
 * Recebe notificações de webhook do AbacatePay
 *
 * Configure no dashboard do AbacatePay:
 * URL: https://seu-dominio.com/api/webhooks/abacatepay?webhookSecret=SEU_SECRET
 */
export async function POST(request: NextRequest) {
  try {
    // Validar o webhook secret
    const { searchParams } = new URL(request.url);
    const webhookSecret = searchParams.get("webhookSecret");

    if (!validateWebhookSecret(webhookSecret)) {
      console.error("Webhook AbacatePay: Secret inválido");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = (await request.json()) as WebhookEvent;
    const eventType = body.event;

    console.log(`Webhook AbacatePay recebido: ${eventType}`);

    switch (eventType) {
      case "billing.paid":
        await handleBillingPaid(body.data);
        break;

      case "withdraw.done":
        console.log("Saque concluído:", body.data);
        break;

      case "withdraw.failed":
        console.log("Saque falhou:", body.data);
        break;

      default:
        console.log("Evento não tratado:", eventType);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Erro no webhook AbacatePay:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Processa pagamento confirmado
 */
async function handleBillingPaid(data: BillingPaidEvent) {
  const { billing, payment } = data;

  console.log("Pagamento confirmado:", {
    billingId: billing.id,
    amount: billing.amount,
    method: payment.method,
    devMode: billing.devMode,
    metadata: billing.metadata,
  });

  // Extrair dados do pagamento
  const userId = billing.metadata?.userId;
  const courseId = billing.metadata?.courseId || billing.products?.[0]?.externalId;
  const couponId = billing.metadata?.couponId;
  const customerEmail = billing.customer?.metadata?.email;

  // Tentar encontrar o usuário
  let studentId = userId;

  if (!studentId && customerEmail) {
    const user = await prisma.user.findUnique({
      where: { email: customerEmail },
    });
    studentId = user?.id;
  }

  if (!studentId || !courseId) {
    console.error("Dados insuficientes para criar inscrição:", { studentId, courseId });
    return;
  }

  // Criar inscrição aprovada
  await createApprovedEnrollment(
    studentId,
    courseId,
    billing.id,
    billing.amount,
    payment.method,
    couponId
  );
}

/**
 * Cria inscrição aprovada após pagamento confirmado
 */
async function createApprovedEnrollment(
  studentId: string,
  courseId: string,
  billingId: string,
  amountCentavos: number,
  paymentMethod: string,
  couponId?: string | null
) {
  try {
    // Verificar se já existe inscrição
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: { studentId, courseId },
    });

    if (existingEnrollment) {
      // Atualizar para aprovado se estava pendente
      if (existingEnrollment.status !== "APPROVED") {
        await prisma.enrollment.update({
          where: { id: existingEnrollment.id },
          data: { status: "APPROVED" },
        });
        console.log("Inscrição existente aprovada:", existingEnrollment.id);
      } else {
        console.log("Inscrição já estava aprovada:", existingEnrollment.id);
      }
      return;
    }

    // Criar nova inscrição aprovada com pagamento
    const enrollment = await prisma.enrollment.create({
      data: {
        studentId,
        courseId,
        status: "APPROVED",
        payment: {
          create: {
            amount: amountCentavos / 100, // Converter para reais
            currency: "BRL",
            status: "COMPLETED",
            paymentMethod: paymentMethod === "PIX" ? "PIX" : "CREDIT_CARD",
            abacatePayBillingId: billingId,
            paidAt: new Date(),
          },
        },
      },
    });

    console.log("Inscrição criada e aprovada:", enrollment.id);

    // Atualizar uso do cupom se aplicável
    if (couponId) {
      await prisma.coupon.update({
        where: { id: couponId },
        data: { usedCount: { increment: 1 } },
      });
      console.log("Uso do cupom registrado:", couponId);
    }
  } catch (error) {
    console.error("Erro ao criar inscrição:", error);
    throw error;
  }
}

// GET para verificação de health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    webhook: "abacatepay",
    timestamp: new Date().toISOString(),
  });
}
