import {type SchemaTypeDefinition} from 'sanity'

import {blockContentType} from './blockContentType'
import {categoryType} from './categoryType'
import {courseType, moduleObject} from './courseType'
import {instructorType} from './instructorType'
import {lessonType} from './lessonType'
import {videoType, videoChapterType, videoChunkType} from './videoType'

export const schema: {types: SchemaTypeDefinition[]} = {
  types: [
    blockContentType,
    categoryType,
    instructorType,
    lessonType,
    courseType,
    moduleObject,
    videoType,
    videoChapterType,
    videoChunkType,
  ],
}

