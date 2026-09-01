import {defineQuery} from 'next-sanity'

// ─── Fragments ──────────────────────────────────────────────────

const imageFragment = /* groq */ `
  asset->{
    _id,
    url,
    metadata { lqip, dimensions }
  },
  alt
`

const instructorFragment = /* groq */ `
  _id,
  name,
  "slug": slug.current,
  photo {
    ${imageFragment}
  },
  expertise
`

const lessonCardFragment = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  videoUrl,
  thumbnail {
    ${imageFragment}
  },
  duration,
  freePreview,
  studentCount
`

// ─── Courses ────────────────────────────────────────────────────

/**
 * All courses for the catalog listing.
 * Includes instructor, category, module count, and total lesson count.
 */
export const COURSES_QUERY = defineQuery(/* groq */ `
  *[_type == "course"] | order(_createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    summary,
    coverImage {
      ${imageFragment}
    },
    level,
    price,
    popular,
    studentCount,
    instructor->{
      ${instructorFragment}
    },
    category->{
      _id,
      title,
      "slug": slug.current
    },
    "moduleCount": count(modules),
    "lessonCount": count(modules[].lessons[]),
    "totalDuration": math::sum(modules[].lessons[]->duration)
  }
`)

/**
 * Courses with modules and lessons expanded for the My Learning dashboard.
 */
export const MY_LEARNING_COURSES_QUERY = defineQuery(/* groq */ `
  *[_type == "course"] | order(_createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    summary,
    coverImage {
      ${imageFragment}
    },
    level,
    price,
    popular,
    studentCount,
    instructor->{
      ${instructorFragment}
    },
    category->{
      _id,
      title,
      "slug": slug.current
    },
    "moduleCount": count(modules),
    "lessonCount": count(modules[].lessons[]),
    "totalDuration": math::sum(modules[].lessons[]->duration),
    modules[] {
      _key,
      title,
      summary,
      lessons[]->{
        _id,
        title,
        "slug": slug.current,
        duration,
        freePreview
      }
    }
  }
`)


/**
 * Single course by slug — full detail with modules expanded.
 * Each module's lessons are dereferenced to show title, slug, duration, etc.
 */
export const COURSE_BY_SLUG_QUERY = defineQuery(/* groq */ `
  *[_type == "course" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    summary,
    coverImage {
      ${imageFragment}
    },
    level,
    price,
    popular,
    studentCount,
    learningOutcomes[] {
      _key,
      icon,
      title,
      description
    },
    instructor->{
      ${instructorFragment}
    },
    category->{
      _id,
      title,
      "slug": slug.current
    },
    modules[] {
      _key,
      title,
      summary,
      lessons[]->{
        ${lessonCardFragment}
      }
    }
  }
`)

// ─── Lessons ────────────────────────────────────────────────────

/**
 * All lessons for generateStaticParams and indexing.
 */
export const ALL_LESSONS_QUERY = defineQuery(/* groq */ `
  *[_type == "lesson"] {
    _id,
    "slug": slug.current
  }
`)

/**
 * Single lesson by slug — full detail including notes, key points,
 * resources, and the parent course context derived via reverse reference.
 */
export const LESSON_BY_SLUG_QUERY = defineQuery(/* groq */ `
  *[_type == "lesson" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    videoUrl,
    thumbnail {
      ${imageFragment}
    },
    duration,
    freePreview,
    studentCount,
    notes,
    keyPoints,
    proTip,
    resources[] {
      _key,
      type,
      title,
      description,
      url
    },
    "course": *[_type == "course" && references(^._id)][0] {
      _id,
      title,
      "slug": slug.current,
      level,
      studentCount,
      coverImage {
        ${imageFragment}
      },
      modules[] {
        _key,
        title,
        summary,
        lessons[]->{
          _id,
          title,
          "slug": slug.current,
          duration,
          freePreview
        }
      }
    }
  }
`)

// ─── Instructors ────────────────────────────────────────────────

/** All instructors for listing. */
export const INSTRUCTORS_QUERY = defineQuery(/* groq */ `
  *[_type == "instructor"] | order(name asc) {
    ${instructorFragment},
    bio
  }
`)

/**
 * Single instructor by slug — full detail + their courses via
 * reverse reference.
 */
export const INSTRUCTOR_BY_SLUG_QUERY = defineQuery(/* groq */ `
  *[_type == "instructor" && slug.current == $slug][0] {
    ${instructorFragment},
    bio,
    "courses": *[_type == "course" && references(^._id)] | order(_createdAt desc) {
      _id,
      title,
      "slug": slug.current,
      summary,
      coverImage {
        ${imageFragment}
      },
      level,
      price,
      popular,
      studentCount,
      category->{
        _id,
        title,
        "slug": slug.current
      },
      "moduleCount": count(modules),
      "lessonCount": count(modules[].lessons[])
    }
  }
`)

// ─── Categories ─────────────────────────────────────────────────

/** All categories for filtering. */
export const CATEGORIES_QUERY = defineQuery(/* groq */ `
  *[_type == "category"] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    description
  }
`)

/** Courses filtered by category slug. */
export const COURSES_BY_CATEGORY_QUERY = defineQuery(/* groq */ `
  *[_type == "course" && category->slug.current == $categorySlug]
  | order(_createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    summary,
    coverImage {
      ${imageFragment}
    },
    level,
    price,
    popular,
    studentCount,
    instructor->{
      ${instructorFragment}
    },
    category->{
      _id,
      title,
      "slug": slug.current
    },
    "moduleCount": count(modules),
    "lessonCount": count(modules[].lessons[])
  }
`)

// ─── Search ─────────────────────────────────────────────────────

/**
 * Fetch lessons by a list of IDs with full course and module context.
 * Used by the search grounding pass to enrich model hits.
 */
export const LESSONS_BY_IDS_QUERY = defineQuery(/* groq */ `
  *[_type == "lesson" && _id in $ids] {
    _id,
    _createdAt,
    title,
    "slug": slug.current,
    duration,
    thumbnail {
      ${imageFragment}
    },
    keyPoints,
    freePreview,
    videoUrl,
    "introNote": notes[0].children[0].text,
    "notesText": pt::text(notes),
    "course": *[_type == "course" && references(^._id)][0] {
      _id,
      title,
      "slug": slug.current,
      coverImage {
        ${imageFragment}
      },
      modules[] {
        _key,
        title,
        summary,
        lessons[]->{
          _id,
          title,
          "slug": slug.current
        }
      }
    }
  }
`)

/**
 * Direct GROQ search query over lessons using token matching.
 */
export const SEARCH_LESSONS_GROQ_QUERY = defineQuery(/* groq */ `
  *[_type == "lesson" && (
    count($terms[@ in ^.title]) > 0 ||
    count($terms[^.title match @]) > 0 ||
    count($terms[pt::text(^.notes) match @]) > 0 ||
    count($terms[^.keyPoints[] match @]) > 0 ||
    count(*[_type == "course" && references(^._id) && count(modules[count($terms[title match @]) > 0]) > 0]) > 0
  )] {
    _id,
    _createdAt,
    title,
    "slug": slug.current,
    duration,
    thumbnail {
      ${imageFragment}
    },
    keyPoints,
    freePreview,
    videoUrl,
    "notesText": pt::text(notes),
    "course": *[_type == "course" && references(^._id)][0] {
      _id,
      title,
      "slug": slug.current,
      coverImage {
        ${imageFragment}
      },
      modules[] {
        _key,
        title,
        summary,
        lessons[]->{
          _id,
          title,
          "slug": slug.current
        }
      }
    }
  }
`)

/**
 * GROQ query to find video documents matching chapter labels or transcript text chunks.
 */
export const SEARCH_VIDEOS_GROQ_QUERY = defineQuery(/* groq */ `
  *[_type == "video" && (
    count($terms[^.chapters[].label match @]) > 0 ||
    count($terms[^.chunks[].text match @]) > 0
  )][0...20] {
    _id,
    url,
    chapters,
    "chunks": chunks[count($terms[text match @]) > 0][0...3]
  }
`)

