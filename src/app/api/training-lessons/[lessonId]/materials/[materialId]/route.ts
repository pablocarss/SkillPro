import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

// DELETE - Remover material da aula de treinamento
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string; materialId: string }> }
) {
  try {
    const user = await requireAuth();

    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { lessonId, materialId } = await params;

    // Verificar se o material existe e pertence à aula
    const material = await prisma.trainingMaterial.findFirst({
      where: {
        id: materialId,
        lessonId,
      },
    });

    if (!material) {
      return NextResponse.json({ error: "Material not found" }, { status: 404 });
    }

    await prisma.trainingMaterial.delete({
      where: { id: materialId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting training material:", error);
    return NextResponse.json(
      { error: "Failed to delete material" },
      { status: 500 }
    );
  }
}
