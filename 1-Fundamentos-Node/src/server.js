import http from 'node:http'
import { json } from './middleware/json.js'
import { routes } from './routes.js'
import { extractQueryParams } from './utils/extract-query-params.js'

// Query Parameters: URL Stateful => Filtro, paginação, não-obrigatorio
// Route Parameters: Identificação de recurso
// Request Body: Envio de informações de um formalário (HTTPs)

const server = http.createServer(async (req, res) => {
  const { method, url } = req

  await json(req, res)

  const route = routes.find(route => {
    return route.method === method && route.path.test(url)
  })

  if (route) {
    const routeParams = req.url.match(route.path)

    //console.log(extractQueryParams(routeParams.groups.query))

    const { query, ...params } = routeParams.groups

    req.params = params
    req.query = query ? extractQueryParams(query) : {}

    return route.handler(req, res)
  }

  return res.writeHead(404).end()
})

server.listen(3333)
