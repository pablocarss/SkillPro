import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { generateCertificate, canGenerateCertificate } from "@/lib/certificate-generator";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { courseId, studentId } = body;

    // Verify authorization (student can only generate their own certificate)
    if (user.role !== "ADMIN" && user.id !== studentId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if can generate
    const canGenerate = await canGenerateCertificate(studentId, courseId);

    if (!canGenerate.canGenerate && !canGenerate.hasExistingCertificate) {
      return NextResponse.json(
        { error: canGenerate.reason || "Cannot generate certificate" },
        { status: 400 }
      );
    }

    // Generate certificate
    const result = await generateCertificate({
      studentId,
      courseId,
      createdById: user.id,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to generate certificate" },
        { status: 500 }
      );
    }

    return NextResponse.json(result.certificate, { status: 201 });
  } catch (error) {
    console.error("Error generating certificate:", error);
    return NextResponse.json(
      { error: "Failed to generate certificate" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const studentId = searchParams.get("studentId") || user.id;

    if (!courseId) {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 });
    }

    // Verify authorization
    if (user.role !== "ADMIN" && user.id !== studentId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const result = await canGenerateCertificate(studentId, courseId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error checking certificate status:", error);
    return NextResponse.json(
      { error: "Failed to check certificate status" },
      { status: 500 }
    );
  }
}
