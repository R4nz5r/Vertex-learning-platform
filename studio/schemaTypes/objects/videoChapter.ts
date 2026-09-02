import {defineField, defineType} from 'sanity'

function formatMmSs(seconds: number | undefined): string {
  if (typeof seconds !== 'number' || isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export const videoChapterType = defineType({
  name: 'videoChapter',
  title: 'Video Chapter',
  type: 'object',
  fields: [
    defineField({
      name: 'startSeconds',
      title: 'Start Seconds',
      type: 'number',
      description: 'Timestamp in seconds from video start',
      validation: (rule) => rule.required().min(0).integer(),
    }),
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'Chapter title or section marker',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      startSeconds: 'startSeconds',
      label: 'label',
    },
    prepare({startSeconds, label}) {
      return {
        title: label || 'Untitled Chapter',
        subtitle: `${formatMmSs(startSeconds)} (${startSeconds ?? 0}s)`,
      }
    },
  },
})
