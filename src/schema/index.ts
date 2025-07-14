import { type TableSchema, storeEventSchema } from '@livestore/livestore'

export const todoSchema = {
  id: 'text primary key',
  title: 'text not null',
  completed: 'integer not null default 0',
  createdAt: 'integer not null',
} satisfies TableSchema

export const schema = {
  version: 1,
  tables: {
    todos: todoSchema,
    storeEvents: storeEventSchema,
  },
} as const

export type Schema = typeof schema
