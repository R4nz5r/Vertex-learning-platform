import { NextResponse } from "next/server";
import { sanityFetch } from "@/sanity/lib/client";
import { defineQuery } from "next-sanity";

export const dynamic = "force-dynamic";

const RECENT_COURSES_QUERY = defineQuery(/* groq */ `
  *[_type == "course"] | order(_createdAt desc)[0...30] {
    _id,
    _createdAt,
    _updatedAt,
    title,
    "slug": slug.current,
    summary,
    level,
    price,
    instructor->{
      name
    },
    category->{
      title
    }
  }
`);

export interface ServerNotification {
  id: string;
  type: "new_course" | "course_milestone" | "announcement";
  title: string;
  message: string;
  href: string;
  timestamp: string | number;
  meta?: {
    courseSlug?: string;
    courseTitle?: string;
    instructorName?: string;
    categoryTitle?: string;
    level?: string;
  };
}

export async function GET() {
  try {
    const courses = await sanityFetch({
      query: RECENT_COURSES_QUERY,
      tags: ["course"],
      revalidate: 0,
    });

    const notifications: ServerNotification[] = [];

    if (Array.isArray(courses)) {
      for (const course of courses) {
        if (!course?.slug || !course?.title) continue;
        notifications.push({
          id: `course-${course._id}`,
          type: "new_course",
          title: "New Course Available",
          message: `${course.title}${course.instructor?.name ? ` by ${course.instructor.name}` : ""} is now available on Vertex! Explore the modules and start learning.`,
          href: `/courses/${course.slug}`,
          timestamp: course._createdAt || new Date().toISOString(),
          meta: {
            courseSlug: course.slug,
            courseTitle: course.title,
            instructorName: course.instructor?.name,
            categoryTitle: course.category?.title,
            level: course.level,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("Error fetching course notifications from Sanity:", error);
    return NextResponse.json(
      { success: false, notifications: [], error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
