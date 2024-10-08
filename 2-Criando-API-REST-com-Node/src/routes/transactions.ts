import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

// Cookies <-> Formas da gente manter contexto entre as requisições

/*
  --  Testes --

  - Unitários: unidade da sua aplicação
  - Integração: comunicação entre duas ou mais unidades
  - E2E - Ponta a ponta: simulam um usuário operando na nossa aplicação

  Pirâmide de testes: E2E (não dependem de nenhuma tecnologia, 
    não dependem de arquitetura ) 

         E2E
      Integração
  Unitários-Unitários          
*/

export async function transactionsRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const transactions = await knex('transactions').select().where({
        session_id: sessionId,
      })

      return reply.send(transactions)
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const transactionIdBodySchema = z.object({
        id: z.string().uuid(),
      })

      const { sessionId } = request.cookies

      const { id } = transactionIdBodySchema.parse(request.params)

      const transaction = await knex('transactions')
        .select()
        .where({
          id,
          session_id: sessionId,
        })
        .first()

      return reply.send(transaction)
    },
  )

  app.get(
    '/summary',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const summary = await knex('transactions')
        .sum('amount', { as: 'amount' })
        .where({
          session_id: sessionId,
        })
        .first()

      return reply.send(summary)
    },
  )

  app.post('/', async (request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body,
    )

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })
}
