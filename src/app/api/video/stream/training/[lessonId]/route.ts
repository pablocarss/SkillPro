import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";

// Generate a signed URL token for video access
function generateVideoToken(userId: string, videoPath: string, expiresAt: number): string {
  const secret = process.env.VIDEO_SECRET || "skillpro-video-secret";
  const data = `${userId}:${videoPath}:${expiresAt}`;
  return createHash("sha256").update(data + secret).digest("hex");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const user = await requireAuth();
    const { lessonId } = await params;

    // Get the training lesson and check enrollment
    const lesson = await prisma.trainingLesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            training: true,
          },
        },
      },
    });

    if (!lesson || !lesson.videoUrl) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // Check if user has access to this training
    const enrollment = await prisma.trainingEnrollment.findFirst({
      where: {
        userId: user.id,
        trainingId: lesson.module.trainingId,
      },
    });

    // Allow admins and enrolled employees
    if (user.role !== "ADMIN" && !enrollment) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Generate a signed URL that expires in 4 hours
    const expiresAt = Date.now() + 4 * 60 * 60 * 1000;
    const token = generateVideoToken(user.id, lesson.videoUrl, expiresAt);

    return NextResponse.json({
      videoUrl: lesson.videoUrl,
      token,
      expiresAt,
      userId: user.id,
      userName: user.name,
    });
  } catch (error) {
    console.error("Error getting training video stream:", error);
    return NextResponse.json(
      { error: "Failed to get video stream" },
      { status: 500 }
    );
  }
}
