import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

// GET - Listar materiais da aula de treinamento
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const { lessonId } = await params;

    const materials = await prisma.trainingMaterial.findMany({
      where: { lessonId },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(materials);
  } catch (error) {
    console.error("Error fetching training materials:", error);
    return NextResponse.json(
      { error: "Failed to fetch materials" },
      { status: 500 }
    );
  }
}

// POST - Criar novo material na aula de treinamento
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const user = await requireAuth();

    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { lessonId } = await params;
    const body = await request.json();
    const { title, description, fileUrl, fileType, fileSize, isExternal } = body;

    // Verificar se a aula existe
    const lesson = await prisma.trainingLesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Obter a ordem do próximo material
    const lastMaterial = await prisma.trainingMaterial.findFirst({
      where: { lessonId },
      orderBy: { order: "desc" },
    });

    const order = lastMaterial ? lastMaterial.order + 1 : 0;

    const material = await prisma.trainingMaterial.create({
      data: {
        title,
        description,
        fileUrl,
        fileType,
        fileSize,
        isExternal: isExternal || false,
        lessonId,
        order,
      },
    });

    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    console.error("Error creating training material:", error);
    return NextResponse.json(
      { error: "Failed to create material" },
      { status: 500 }
    );
  }
}
