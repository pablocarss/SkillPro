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

// Verify video access token
function verifyVideoToken(token: string, userId: string, videoPath: string, expiresAt: number): boolean {
  const expectedToken = generateVideoToken(userId, videoPath, expiresAt);
  return token === expectedToken && Date.now() < expiresAt;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const user = await requireAuth();
    const { videoId } = await params;

    // Decode the videoId (it's the lessonId encoded)
    const lessonId = videoId;

    // Get the lesson and check enrollment
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson || !lesson.videoUrl) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // Check if user has access to this course
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: user.id,
        courseId: lesson.module.courseId,
        status: "APPROVED",
      },
    });

    // Allow admins and enrolled students
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
    console.error("Error getting video stream:", error);
    return NextResponse.json(
      { error: "Failed to get video stream" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const user = await requireAuth();
    const { videoId } = await params;
    const { token, expiresAt, videoUrl } = await request.json();

    // Verify the token
    if (!verifyVideoToken(token, user.id, videoUrl, expiresAt)) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 403 });
    }

    // Return the actual video URL for streaming
    return NextResponse.json({ verified: true, url: videoUrl });
  } catch (error) {
    console.error("Error verifying video token:", error);
    return NextResponse.json(
      { error: "Failed to verify video token" },
      { status: 500 }
    );
  }
}
