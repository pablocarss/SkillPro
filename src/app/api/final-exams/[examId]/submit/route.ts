import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCertificate } from "@/lib/certificate-generator";

export async function POST(request: NextRequest, { params }: { params: Promise<{ examId: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { examId } = await params;
    const body = await request.json();
    const { answers } = body;

    const exam = await prisma.finalExam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          include: {
            answers: true,
          },
        },
        course: true,
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    let correctAnswers = 0;
    const totalQuestions = exam.questions.length;

    exam.questions.forEach((question) => {
      const userAnswer = answers[question.id];
      const correctAnswer = question.answers.find((a) => a.isCorrect);

      if (userAnswer === correctAnswer?.id) {
        correctAnswers++;
      }
    });

    const score = (correctAnswers / totalQuestions) * 100;
    const passed = score >= exam.passingScore;

    const attempt = await prisma.studentExamAttempt.create({
      data: {
        studentId: session.user.id,
        examId,
        score,
        answers,
        passed,
      },
    });

    // Generate certificate if passed
    let certificateGenerated = false;
    if (passed) {
      try {
        const result = await generateCertificate({
          studentId: session.user.id,
          courseId: exam.courseId,
          createdById: session.user.id,
        });

        if (result.success) {
          certificateGenerated = true;
          console.log("Certificate generated successfully for student:", session.user.id);
        } else {
          console.error("Failed to generate certificate:", result.error);
        }
      } catch (error) {
        console.error("Error generating certificate:", error);
        // Continue even if certificate generation fails
      }
    }

    return NextResponse.json({
      score,
      passed,
      correctAnswers,
      totalQuestions,
      attemptId: attempt.id,
      certificateGenerated,
    });
  } catch (error) {
    console.error("Error submitting exam:", error);
    return NextResponse.json({ error: "Failed to submit exam" }, { status: 500 });
  }
}
