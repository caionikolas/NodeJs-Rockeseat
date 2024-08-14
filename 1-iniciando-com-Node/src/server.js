// -- padrao antigo de importação --
//const http = require('http')

// -- padrão novo --
import http from 'node:http'
/*METODOS HTTP

GET => Buscar um recurso do back-end
POST => Criar um recurso do back-end
PUT => Atualizar um recurso do back-end
PATCH => Atualizar uma informação especifica de um recurso do back-end
DELETE => Deletar um recurso do back-end

Cabeçados (Requisição/resposta) => Metadados
*/
const users = []

const server = http.createServer((req, res) => {
  const { method, url } = req

  if (method === 'GET' && url === '/users') {
    return res
      .setHeader('Content-type', 'application/json')
      .end(JSON.stringify(users))
  }

  if (method === 'POST' && url === '/users') {
    users.push({
      name: 'John Doe',
      email: 'johndoe@example.com'
    })

    return res.end('Criação de usuários')
  }

  return res.end('Hello World')
})

server.listen(3334)
