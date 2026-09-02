import {BookIcon, PlayIcon, TagIcon, UserIcon, VideoIcon} from '@sanity/icons'
import type {StructureResolver} from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Vertex')
    .items([
      S.listItem()
        .title('Courses')
        .icon(BookIcon)
        .child(S.documentTypeList('course').title('Courses')),
      S.listItem()
        .title('Lessons')
        .icon(PlayIcon)
        .child(S.documentTypeList('lesson').title('Lessons')),
      S.divider(),
      S.listItem()
        .title('Instructors')
        .icon(UserIcon)
        .child(S.documentTypeList('instructor').title('Instructors')),
      S.listItem()
        .title('Categories')
        .icon(TagIcon)
        .child(S.documentTypeList('category').title('Categories')),
      S.divider(),
      S.listItem()
        .title('Videos (Internal)')
        .icon(VideoIcon)
        .child(S.documentTypeList('video').title('Videos (Ingested)')),
    ])

