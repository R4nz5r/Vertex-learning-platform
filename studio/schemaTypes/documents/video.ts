import {VideoIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const videoType = defineType({
  name: 'video',
  title: 'Video',
  type: 'document',
  icon: VideoIcon,
  readOnly: true,
  description: 'Internal lookup data ingested by offline pipeline. Do not edit manually.',
  fields: [
    defineField({
      name: 'videoId',
      title: 'Video ID',
      type: 'string',
      description: 'Provider video ID (e.g. YouTube 11-char ID)',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'id',
      title: 'Legacy ID / Alias',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      description: 'Canonical video URL matching lesson videoUrl',
      validation: (rule) =>
        rule.required().uri({
          scheme: ['http', 'https'],
        }),
    }),
    defineField({
      name: 'provider',
      title: 'Provider',
      type: 'string',
      description: 'Hosting platform',
      options: {
        list: [
          {title: 'YouTube', value: 'youtube'},
          {title: 'Vimeo', value: 'vimeo'},
          {title: 'Bunny Stream', value: 'bunny'},
          {title: 'Generic', value: 'generic'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'duration',
      title: 'Duration (seconds)',
      type: 'number',
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: 'ingestedAt',
      title: 'Ingested At',
      type: 'datetime',
      description: 'Timestamp when this video was last processed by the pipeline',
    }),
    defineField({
      name: 'chapters',
      title: 'Chapters (Table of Contents)',
      type: 'array',
      of: [defineArrayMember({type: 'videoChapter'})],
    }),
    defineField({
      name: 'chunks',
      title: 'Transcript Chunks',
      type: 'array',
      of: [defineArrayMember({type: 'videoChunk'})],
    }),
  ],
  preview: {
    select: {
      videoId: 'videoId',
      title: 'title',
      provider: 'provider',
      chapters: 'chapters',
      chunks: 'chunks',
    },
    prepare({videoId, title, provider, chapters, chunks}) {
      const chapterCount = Array.isArray(chapters) ? chapters.length : 0
      const chunkCount = Array.isArray(chunks) ? chunks.length : 0
      return {
        title: title || videoId || 'Untitled Video',
        subtitle: `${provider ? `[${provider}] ` : ''}${chapterCount} chapters · ${chunkCount} chunks`,
      }
    },
  },
})
