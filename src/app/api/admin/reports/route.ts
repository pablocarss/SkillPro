import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "all"; // all, courses, trainings

    // ===== COURSES STATISTICS =====
    const courseStats = await getCourseStats();

    // ===== TRAINING STATISTICS =====
    const trainingStats = await getTrainingStats();

    // ===== GENERAL STATISTICS =====
    const generalStats = {
      totalUsers: await prisma.user.count(),
      totalStudents: await prisma.user.count({ where: { role: "STUDENT" } }),
      totalEmployees: await prisma.user.count({ where: { role: "EMPLOYEE" } }),
      totalCompanies: await prisma.company.count(),
      totalCourses: await prisma.course.count(),
      totalTrainings: await prisma.training.count(),
    };

    return NextResponse.json({
      general: generalStats,
      courses: courseStats,
      trainings: trainingStats,
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Erro ao buscar relatórios" },
      { status: 500 }
    );
  }
}

async function getCourseStats() {
  // Total enrollments
  const totalEnrollments = await prisma.enrollment.count();

  // Completed enrollments (have certificate)
  const completedEnrollments = await prisma.certificate.count();

  // Get all courses with enrollment details
  const courses = await prisma.course.findMany({
    include: {
      modules: {
        include: {
          lessons: true,
        },
      },
      enrollments: {
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      certificates: true,
    },
  });

  // Calculate progress for each enrollment
  const courseDetails = await Promise.all(
    courses.map(async (course) => {
      const totalLessons = course.modules.reduce(
        (acc, m) => acc + m.lessons.length,
        0
      );

      const enrollmentDetails = await Promise.all(
        course.enrollments.map(async (enrollment) => {
          // Get lesson progress for this student
          const completedLessons = await prisma.lessonProgress.count({
            where: {
              studentId: enrollment.studentId,
              lessonId: {
                in: course.modules.flatMap((m) => m.lessons.map((l) => l.id)),
              },
              completed: true,
            },
          });

          // Get last accessed lesson
          const lastProgress = await prisma.lessonProgress.findFirst({
            where: {
              studentId: enrollment.studentId,
              lessonId: {
                in: course.modules.flatMap((m) => m.lessons.map((l) => l.id)),
              },
            },
            orderBy: {
              updatedAt: "desc",
            },
            include: {
              lesson: {
                select: {
                  title: true,
                  module: {
                    select: {
                      title: true,
                    },
                  },
                },
              },
            },
          });

          const hasCertificate = course.certificates.some(
            (c) => c.studentId === enrollment.studentId
          );

          const progressPercentage =
            totalLessons > 0
              ? Math.round((completedLessons / totalLessons) * 100)
              : 0;

          return {
            id: enrollment.id,
            student: enrollment.student,
            enrolledAt: enrollment.createdAt,
            completedLessons,
            totalLessons,
            progressPercentage,
            hasCertificate,
            lastLesson: lastProgress?.lesson
              ? `${lastProgress.lesson.module.title} - ${lastProgress.lesson.title}`
              : null,
            lastActivity: lastProgress?.updatedAt || enrollment.createdAt,
            status: hasCertificate
              ? "completed"
              : progressPercentage === 0
              ? "not_started"
              : "in_progress",
          };
        })
      );

      // Group by status
      const statusCount = {
        completed: enrollmentDetails.filter((e) => e.status === "completed").length,
        in_progress: enrollmentDetails.filter((e) => e.status === "in_progress").length,
        not_started: enrollmentDetails.filter((e) => e.status === "not_started").length,
      };

      return {
        id: course.id,
        title: course.title,
        totalLessons,
        totalEnrollments: course.enrollments.length,
        statusCount,
        completionRate:
          course.enrollments.length > 0
            ? Math.round((statusCount.completed / course.enrollments.length) * 100)
            : 0,
        enrollments: enrollmentDetails,
      };
    })
  );

  // Students who stopped (in_progress but no activity in last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const stoppedStudents = courseDetails.flatMap((course) =>
    course.enrollments
      .filter(
        (e) =>
          e.status === "in_progress" &&
          new Date(e.lastActivity) < sevenDaysAgo
      )
      .map((e) => ({
        ...e,
        courseName: course.title,
        courseId: course.id,
      }))
  );

  return {
    totalEnrollments,
    completedEnrollments,
    completionRate:
      totalEnrollments > 0
        ? Math.round((completedEnrollments / totalEnrollments) * 100)
        : 0,
    courses: courseDetails,
    stoppedStudents,
  };
}

async function getTrainingStats() {
  // Total enrollments
  const totalEnrollments = await prisma.trainingEnrollment.count();

  // Completed enrollments (have certificate)
  const completedEnrollments = await prisma.trainingCertificate.count();

  // Get all trainings with enrollment details
  const trainings = await prisma.training.findMany({
    include: {
      company: {
        select: {
          name: true,
        },
      },
      trainingCompanies: {
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      modules: {
        include: {
          lessons: true,
        },
      },
      enrollments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              company: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
      certificates: true,
    },
  });

  // Calculate progress for each enrollment
  const trainingDetails = await Promise.all(
    trainings.map(async (training) => {
      const totalLessons = training.modules.reduce(
        (acc, m) => acc + m.lessons.length,
        0
      );

      const enrollmentDetails = await Promise.all(
        training.enrollments.map(async (enrollment) => {
          // Get lesson progress for this user
          const completedLessons = await prisma.trainingLessonProgress.count({
            where: {
              userlId: enrollment.userId,
              lessonId: {
                in: training.modules.flatMap((m) => m.lessons.map((l) => l.id)),
              },
              completed: true,
            },
          });

          // Get last accessed lesson
          const lastProgress = await prisma.trainingLessonProgress.findFirst({
            where: {
              userlId: enrollment.userId,
              lessonId: {
                in: training.modules.flatMap((m) => m.lessons.map((l) => l.id)),
              },
            },
            orderBy: {
              updatedAt: "desc",
            },
            include: {
              lesson: {
                select: {
                  title: true,
                  module: {
                    select: {
                      title: true,
                    },
                  },
                },
              },
            },
          });

          const hasCertificate = training.certificates.some(
            (c) => c.userId === enrollment.userId
          );

          const progressPercentage =
            totalLessons > 0
              ? Math.round((completedLessons / totalLessons) * 100)
              : 0;

          return {
            id: enrollment.id,
            user: enrollment.user,
            enrolledAt: enrollment.createdAt,
            completedLessons,
            totalLessons,
            progressPercentage,
            hasCertificate,
            lastLesson: lastProgress?.lesson
              ? `${lastProgress.lesson.module.title} - ${lastProgress.lesson.title}`
              : null,
            lastActivity: lastProgress?.updatedAt || enrollment.createdAt,
            status: hasCertificate
              ? "completed"
              : progressPercentage === 0
              ? "not_started"
              : "in_progress",
          };
        })
      );

      // Group by status
      const statusCount = {
        completed: enrollmentDetails.filter((e) => e.status === "completed").length,
        in_progress: enrollmentDetails.filter((e) => e.status === "in_progress").length,
        not_started: enrollmentDetails.filter((e) => e.status === "not_started").length,
      };

      // Group by company
      const byCompany: Record<string, number> = {};
      enrollmentDetails.forEach((e) => {
        const companyName = e.user.company?.name || "Sem empresa";
        byCompany[companyName] = (byCompany[companyName] || 0) + 1;
      });

      return {
        id: training.id,
        title: training.title,
        company: training.company?.name,
        linkedCompanies: training.trainingCompanies.map((tc) => tc.company.name),
        totalLessons,
        totalEnrollments: training.enrollments.length,
        statusCount,
        byCompany,
        completionRate:
          training.enrollments.length > 0
            ? Math.round((statusCount.completed / training.enrollments.length) * 100)
            : 0,
        enrollments: enrollmentDetails,
      };
    })
  );

  // Employees who stopped (in_progress but no activity in last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const stoppedEmployees = trainingDetails.flatMap((training) =>
    training.enrollments
      .filter(
        (e) =>
          e.status === "in_progress" &&
          new Date(e.lastActivity) < sevenDaysAgo
      )
      .map((e) => ({
        ...e,
        trainingName: training.title,
        trainingId: training.id,
      }))
  );

  return {
    totalEnrollments,
    completedEnrollments,
    completionRate:
      totalEnrollments > 0
        ? Math.round((completedEnrollments / totalEnrollments) * 100)
        : 0,
    trainings: trainingDetails,
    stoppedEmployees,
  };
}
