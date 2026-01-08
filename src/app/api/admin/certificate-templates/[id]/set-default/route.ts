import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Unset all other templates as default
    await prisma.certificateTemplate.updateMany({
      where: { isDefault: true },
      data: { isDefault: false },
    });

    // Set this template as default
    const template = await prisma.certificateTemplate.update({
      where: { id },
      data: { isDefault: true },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error setting default template:", error);
    return NextResponse.json(
      { error: "Failed to set default template" },
      { status: 500 }
    );
  }
}
