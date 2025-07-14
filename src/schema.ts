import { Events, makeSchema, Schema, State } from '@livestore/livestore'

// Define the todos table
export const tables = {
  todos: State.SQLite.table({
    name: 'todos',
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      text: State.SQLite.text(),
      completed: State.SQLite.boolean(),
      createdAt: State.SQLite.integer(),
    },
  }),
}

// Define events for todo operations
export const events = {
  todoCreated: Events.synced({
    name: 'v1.TodoCreated',
    schema: Schema.Struct({
      id: Schema.String,
      text: Schema.String,
      createdAt: Schema.Number,
    }),
  }),
  todoToggled: Events.synced({
    name: 'v1.TodoToggled',
    schema: Schema.Struct({
      id: Schema.String,
      completed: Schema.Boolean,
    }),
  }),
  todoTextUpdated: Events.synced({
    name: 'v1.TodoTextUpdated',
    schema: Schema.Struct({
      id: Schema.String,
      text: Schema.String,
    }),
  }),
  todoDeleted: Events.synced({
    name: 'v1.TodoDeleted',
    schema: Schema.Struct({
      id: Schema.String,
    }),
  }),
  allTodosCompleted: Events.synced({
    name: 'v1.AllTodosCompleted',
    schema: Schema.Struct({
      completed: Schema.Boolean,
    }),
  }),
  completedTodosCleared: Events.synced({
    name: 'v1.CompletedTodosCleared',
    schema: Schema.Struct({}),
  }),
}

// Create the schema with materializers
export const schema = makeSchema({
  events,
  state: State.SQLite.makeState({
    tables,
    materializers: {
      'v1.TodoCreated': ({ id, text, createdAt }: any) => 
        `INSERT INTO todos (id, text, completed, createdAt) VALUES ('${id}', '${text}', 0, ${createdAt})`,
      'v1.TodoToggled': ({ id, completed }: any) => 
        `UPDATE todos SET completed = ${completed ? 1 : 0} WHERE id = '${id}'`,
      'v1.TodoTextUpdated': ({ id, text }: any) => 
        `UPDATE todos SET text = '${text}' WHERE id = '${id}'`,
      'v1.TodoDeleted': ({ id }: any) => 
        `DELETE FROM todos WHERE id = '${id}'`,
      'v1.AllTodosCompleted': ({ completed }: any) => 
        `UPDATE todos SET completed = ${completed ? 1 : 0}`,
      'v1.CompletedTodosCleared': () => 
        `DELETE FROM todos WHERE completed = 1`,
    },
  }),
})