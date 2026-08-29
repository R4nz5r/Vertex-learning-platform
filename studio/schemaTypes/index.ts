import {type SchemaTypeDefinition} from 'sanity'

import {blockContentType} from './blockContentType'
import {categoryType} from './categoryType'
import {courseType, moduleObject} from './courseType'
import {instructorType} from './instructorType'
import {lessonType} from './lessonType'

export const schema: {types: SchemaTypeDefinition[]} = {
  types: [
    blockContentType,
    categoryType,
    instructorType,
    lessonType,
    courseType,
    moduleObject,
  ],
}
