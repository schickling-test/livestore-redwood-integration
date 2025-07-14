import { makeWorker } from '@livestore/adapter-web/worker'
import { schema } from './schema/index.js'

makeWorker({ schema })
