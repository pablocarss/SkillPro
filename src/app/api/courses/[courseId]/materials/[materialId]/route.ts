import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

// DELETE - Remover material
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; materialId: string }> }
) {
  try {
    const user = await requireAuth();

    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { courseId, materialId } = await params;

    // Verificar se o material existe e pertence ao curso
    const material = await prisma.courseMaterial.findFirst({
      where: {
        id: materialId,
        courseId,
      },
    });

    if (!material) {
      return NextResponse.json({ error: "Material not found" }, { status: 404 });
    }

    await prisma.courseMaterial.delete({
      where: { id: materialId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting material:", error);
    return NextResponse.json(
      { error: "Failed to delete material" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar material
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; materialId: string }> }
) {
  try {
    const user = await requireAuth();

    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { courseId, materialId } = await params;
    const body = await request.json();
    const { title, description } = body;

    // Verificar se o material existe e pertence ao curso
    const material = await prisma.courseMaterial.findFirst({
      where: {
        id: materialId,
        courseId,
      },
    });

    if (!material) {
      return NextResponse.json({ error: "Material not found" }, { status: 404 });
    }

    const updatedMaterial = await prisma.courseMaterial.update({
      where: { id: materialId },
      data: {
        title,
        description,
      },
    });

    return NextResponse.json(updatedMaterial);
  } catch (error) {
    console.error("Error updating material:", error);
    return NextResponse.json(
      { error: "Failed to update material" },
      { status: 500 }
    );
  }
}
