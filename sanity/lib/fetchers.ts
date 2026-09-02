import {sanityFetch} from './client'
import {
  ALL_LESSONS_QUERY,
  CATEGORIES_QUERY,
  COURSE_BY_SLUG_QUERY,
  COURSES_BY_CATEGORY_QUERY,
  COURSES_QUERY,
  INSTRUCTOR_BY_SLUG_QUERY,
  INSTRUCTORS_QUERY,
  LESSON_BY_SLUG_QUERY,
  MY_LEARNING_COURSES_QUERY,
} from './queries'

// ─── Courses ────────────────────────────────────────────────────

/**
 * Fetch all courses with modules and lessons expanded for My Learning dashboard.
 */
export async function getMyLearningCourses() {
  return sanityFetch({
    query: MY_LEARNING_COURSES_QUERY,
    tags: ['course', 'instructor', 'category', 'lesson'],
  })
}


/**
 * Fetch all courses for the catalog listing.
 * Tagged for revalidation when any course, instructor, or category updates.
 */
export async function getCourses() {
  return sanityFetch({
    query: COURSES_QUERY,
    tags: ['course', 'instructor', 'category'],
  })
}

/**
 * Fetch a single course by slug with full module/lesson expansion.
 * Tagged specifically for this course slug as well as related entities.
 */
export async function getCourseBySlug(slug: string) {
  return sanityFetch({
    query: COURSE_BY_SLUG_QUERY,
    params: {slug},
    tags: ['course', `course:${slug}`, 'instructor', 'category', 'lesson'],
  })
}

// ─── Lessons ────────────────────────────────────────────────────

/**
 * Fetch all lesson slugs for static param generation.
 */
export async function getAllLessons() {
  return sanityFetch({
    query: ALL_LESSONS_QUERY,
    tags: ['lesson'],
  })
}

/**
 * Fetch a single lesson by slug with parent course context.
 * Tagged for lesson-specific and parent course revalidation.
 */
export async function getLessonBySlug(slug: string) {
  return sanityFetch({
    query: LESSON_BY_SLUG_QUERY,
    params: {slug},
    tags: ['lesson', `lesson:${slug}`, 'course'],
  })
}

// ─── Instructors ────────────────────────────────────────────────

/**
 * Fetch all instructors.
 */
export async function getInstructors() {
  return sanityFetch({
    query: INSTRUCTORS_QUERY,
    tags: ['instructor'],
  })
}

/**
 * Fetch a single instructor by slug with their courses.
 */
export async function getInstructorBySlug(slug: string) {
  return sanityFetch({
    query: INSTRUCTOR_BY_SLUG_QUERY,
    params: {slug},
    tags: ['instructor', `instructor:${slug}`, 'course'],
  })
}

// ─── Categories ─────────────────────────────────────────────────

/**
 * Fetch all categories.
 */
export async function getCategories() {
  return sanityFetch({
    query: CATEGORIES_QUERY,
    tags: ['category'],
  })
}

/**
 * Fetch courses filtered by category slug.
 */
export async function getCoursesByCategory(categorySlug: string) {
  return sanityFetch({
    query: COURSES_BY_CATEGORY_QUERY,
    params: {categorySlug},
    tags: ['course', `category:${categorySlug}`],
  })
}
