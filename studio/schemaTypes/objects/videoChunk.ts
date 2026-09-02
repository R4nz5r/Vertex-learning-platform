import {defineField, defineType} from 'sanity'

function formatMmSs(seconds: number | undefined): string {
  if (typeof seconds !== 'number' || isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export const videoChunkType = defineType({
  name: 'videoChunk',
  title: 'Video Chunk',
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
      name: 'text',
      title: 'Transcript Text',
      type: 'text',
      rows: 2,
      description: 'Timestamped excerpt of spoken dialogue or captions',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      startSeconds: 'startSeconds',
      text: 'text',
    },
    prepare({startSeconds, text}) {
      const previewText = text
        ? text.length > 70
          ? `${text.slice(0, 70)}…`
          : text
        : 'Empty chunk'
      return {
        title: previewText,
        subtitle: `${formatMmSs(startSeconds)} (${startSeconds ?? 0}s)`,
      }
    },
  },
})
