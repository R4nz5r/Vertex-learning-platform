import {PlayIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const lessonType = defineType({
  name: 'lesson',
  title: 'Lesson',
  type: 'document',
  icon: PlayIcon,
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
      name: 'videoUrl',
      title: 'Video URL',
      type: 'url',
      description: 'YouTube, Vimeo, or Bunny video URL',
      validation: (rule) =>
        rule.required().uri({
          scheme: ['http', 'https'],
        }),
    }),
    defineField({
      name: 'poster',
      title: 'Poster / Thumbnail',
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
      name: 'duration',
      title: 'Duration',
      type: 'string',
      description: 'e.g. "12:30"',
    }),
    defineField({
      name: 'freePreview',
      title: 'Free Preview',
      type: 'boolean',
      description: 'Display label only — not access control',
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
      name: 'notes',
      title: 'Notes',
      type: 'blockContent',
      description: 'Rich-text lesson notes (Portable Text)',
    }),
    defineField({
      name: 'keyPoints',
      title: 'Key Points',
      type: 'array',
      description: '"In this lesson you will learn…"',
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({
      name: 'proTip',
      title: 'Pro Tip',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'resources',
      title: 'Resources',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'resource',
          title: 'Resource',
          fields: [
            defineField({
              name: 'resourceType',
              title: 'Type',
              type: 'string',
              options: {
                list: [
                  {title: 'Documentation', value: 'documentation'},
                  {title: 'GitHub Repo', value: 'github'},
                  {title: 'Article', value: 'article'},
                  {title: 'Video', value: 'video'},
                  {title: 'Tool', value: 'tool'},
                  {title: 'Other', value: 'other'},
                ],
              },
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
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (rule) =>
                rule.required().uri({
                  scheme: ['http', 'https'],
                }),
            }),
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'resourceType',
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'poster',
    },
  },
})
