// -- padrao antigo de importação --
//const http = require('http')

// -- padrão novo --
import http from 'node:http'

const server = http.createServer((req, res) => {})

server.listen(3333)
