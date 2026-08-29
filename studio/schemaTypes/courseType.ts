import {BookIcon, DocumentsIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const moduleObject = defineType({
  name: 'module',
  title: 'Module',
  type: 'object',
  icon: DocumentsIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'lessons',
      title: 'Lessons',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'lesson'}],
        }),
      ],
      validation: (rule) => rule.min(1).error('A module needs at least one lesson'),
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
})

export const courseType = defineType({
  name: 'course',
  title: 'Course',
  type: 'document',
  icon: BookIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 4,
      description: 'Marketing blurb for the catalog',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'level',
      title: 'Level',
      type: 'string',
      options: {
        list: [
          {title: 'Beginner', value: 'beginner'},
          {title: 'Intermediate', value: 'intermediate'},
          {title: 'Advanced', value: 'advanced'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
      description: 'Display price (e.g. 49.99)',
    }),
    defineField({
      name: 'popular',
      title: 'Popular',
      type: 'boolean',
      description: 'Flag this course as popular in the catalog',
      initialValue: false,
    }),
    defineField({
      name: 'studentCount',
      title: 'Student Count',
      type: 'number',
      description: 'For display purposes',
      initialValue: 0,
    }),
    defineField({
      name: 'learningOutcomes',
      title: 'Learning Outcomes',
      description: '"What you\'ll learn" section',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'learningOutcome',
          title: 'Outcome',
          fields: [
            defineField({
              name: 'icon',
              title: 'Icon',
              type: 'string',
              description: 'Icon identifier (e.g. "code", "brain", "rocket")',
            }),
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 2,
            }),
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'description',
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'instructor',
      title: 'Instructor',
      type: 'reference',
      to: [{type: 'instructor'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{type: 'category'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'modules',
      title: 'Modules',
      type: 'array',
      of: [defineArrayMember({type: 'module'})],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'coverImage',
      instructor: 'instructor.name',
    },
    prepare(selection) {
      const {instructor} = selection
      return {
        ...selection,
        subtitle: instructor ? `by ${instructor}` : undefined,
      }
    },
  },
})
