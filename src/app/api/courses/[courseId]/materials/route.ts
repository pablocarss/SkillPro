import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

// GET - Listar materiais do curso
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    const materials = await prisma.courseMaterial.findMany({
      where: { courseId },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(materials);
  } catch (error) {
    console.error("Error fetching materials:", error);
    return NextResponse.json(
      { error: "Failed to fetch materials" },
      { status: 500 }
    );
  }
}

// POST - Criar novo material
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const user = await requireAuth();

    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { courseId } = await params;
    const body = await request.json();
    const { title, description, fileUrl, fileType, fileSize, isExternal } = body;

    // Verificar se o curso existe
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Obter a ordem do próximo material
    const lastMaterial = await prisma.courseMaterial.findFirst({
      where: { courseId },
      orderBy: { order: "desc" },
    });

    const order = lastMaterial ? lastMaterial.order + 1 : 0;

    const material = await prisma.courseMaterial.create({
      data: {
        title,
        description,
        fileUrl,
        fileType,
        fileSize,
        isExternal: isExternal || false,
        courseId,
        order,
      },
    });

    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    console.error("Error creating material:", error);
    return NextResponse.json(
      { error: "Failed to create material" },
      { status: 500 }
    );
  }
}
