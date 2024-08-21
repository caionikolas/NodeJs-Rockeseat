import { expect, beforeAll, afterAll, describe, it, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'child_process'

// Criando categorias 
describe('Transactions routes',
  () => {
    // Executar algum codigo antes de todas as execuções
    beforeAll(async () => {
      await app.ready()
    })

    // Executar algum codigo depois de todas as execuções
    afterAll(async () => {
      await app.close()
    })

    beforeEach(() => {
      execSync('npm run knex migrate:rollback --all')
      execSync('npm run knex migrate:latest')
    })

    it('should be able to create a new transaction', async () => {
      // Fazer a chamada HTTP p/ criar uma nova transação
      const response = await request(app.server).post('/transactions').send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      })

      // Validação
      expect(response.statusCode).toEqual(201)
    })

    it('should be able to list all transactions', async () => {
      const createTransactionResponse = await request(app.server)
        .post('/transactions')
        .send({
          title: 'New transaction',
          amount: 5000,
          type: 'credit',
        })

      const cookies = createTransactionResponse.get('Set-Cookie') ?? []

      const listTransactionResponse = await request(app.server)
        .get('/transactions')
        .set('Cookie', cookies)
        .expect(200)

      expect(listTransactionResponse.body).toEqual([
        expect.objectContaining({
          title: 'New transaction',
          amount: 5000,
        })
      ])
    })

    it('should be able to get a specific transaction', async () => {
      const createTransactionResponse = await request(app.server)
        .post('/transactions')
        .send({
          title: 'New transaction',
          amount: 5000,
          type: 'credit',
        })

      const cookies = createTransactionResponse.get('Set-Cookie') ?? []

      const listTransactionResponse = await request(app.server)
        .get('/transactions')
        .set('Cookie', cookies)
        .expect(200)

      const transactionId = listTransactionResponse.body[0].id

      const getTransactionResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies)
      .expect(200)

      expect(getTransactionResponse.body).toEqual(
        expect.objectContaining({
          title: 'New transaction',
          amount: 5000,
        })
      )
    })

    it.only('should be able to get the summary', async () => {
      const createTransactionResponse = await request(app.server)
        .post('/transactions')
        .send({
          title: 'Credit transaction',
          amount: 5000,
          type: 'credit',
        })

      const cookies = createTransactionResponse.get('Set-Cookie') ?? []

      await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send({
        title: 'Debit transaction',
        amount: 2000,
        type: 'debit',
      })

      const summaryResponse = await request(app.server)
        .get('/transactions/summary')
        .set('Cookie', cookies)
        .expect(200)

      expect(summaryResponse.body).toEqual({
        amount: 3000
      })
    })
  })
