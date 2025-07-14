import { Events, makeSchema, Schema, State } from '@livestore/livestore'

export const tables = {
  todos: State.SQLite.table({
    name: 'todos',
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      title: State.SQLite.text(),
      completed: State.SQLite.boolean(),
      createdAt: State.SQLite.integer(),
    },
  }),
}

export const events = {
  todoCreated: Events.synced({
    name: 'v1.TodoCreated',
    schema: Schema.Struct({
      id: Schema.String,
      title: Schema.String,
      createdAt: Schema.Number,
    }),
    materializer: ({ id, title, createdAt }) => ({
      todos: [{ id, title, completed: false, createdAt }],
    }),
  }),
  todoToggled: Events.synced({
    name: 'v1.TodoToggled',
    schema: Schema.Struct({
      id: Schema.String,
      completed: Schema.Boolean,
    }),
    materializer: ({ id, completed }) => ({
      todos: { id, $op: 'update', completed },
    }),
  }),
  todoDeleted: Events.synced({
    name: 'v1.TodoDeleted',
    schema: Schema.Struct({
      id: Schema.String,
    }),
    materializer: ({ id }) => ({
      todos: { id, $op: 'delete' },
    }),
  }),
}

export const schema = makeSchema({
  events,
  state: State.SQLite.makeState({ tables }),
})

export type DbSchema = typeof schema
