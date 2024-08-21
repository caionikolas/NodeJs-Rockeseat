import { app } from './app'
import { env } from './env'

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
