import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CheckoutClient } from "./checkout-client";
import { notFound } from "next/navigation";

export default async function CheckoutPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;

  // Verificar autenticação
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect(`/login?redirect=/checkout/${courseId}`);
  }

  // Buscar curso
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
      isPublished: true,
    },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      thumbnail: true,
    },
  });

  if (!course) {
    notFound();
  }

  // Verificar se curso é pago
  if (!course.price || course.price <= 0) {
    redirect(`/cursos/${courseId}`);
  }

  // Verificar se já está inscrito
  const existingEnrollment = await prisma.enrollment.findFirst({
    where: {
      courseId: course.id,
      studentId: session.user.id,
    },
  });

  if (existingEnrollment) {
    redirect("/dashboard/meus-cursos");
  }

  return (
    <CheckoutClient
      course={{
        ...course,
        price: course.price!,
      }}
      user={{
        name: session.user.name || "",
        email: session.user.email || "",
      }}
    />
  );
}
