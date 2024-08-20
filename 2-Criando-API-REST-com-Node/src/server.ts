import fastify from 'fastify'
import cookie from '@fastify/cookie'

import { env } from './env'
import { transactionsRoutes } from './routes/transactions'
// import { randomUUID } from 'node:crypto'

const app = fastify()

app.register(cookie)
app.register(transactionsRoutes, {
  prefix: 'transactions',
})

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('HTTP server running!')
  })

/*
    .insert({
      id: randomUUID(),
      title: 'Transação de teste',
      amount: 1000,
    })
    .returning('*')
  */
