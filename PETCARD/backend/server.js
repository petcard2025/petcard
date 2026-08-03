// PUNTO DE ENTRADA DEL BACKEND
require('dotenv').config()
const https = require('https')
const fs = require('fs')
const path = require('path')
const app = require('./src/app')
const routes = require('./src/routes')
require('./src/config/database') // Mantiene la conexion activa

// Montar rutas
app.use('/api', routes)

const PORT = process.env.PORT || 3001

// Rutas de los certificados SSL
const keyPath = path.join(__dirname, 'certs', 'localhost.key')
const certPath = path.join(__dirname, 'certs', 'localhost.crt')

console.log('Buscando certificados en:')
console.log('  Key:', keyPath)
console.log('  Cert:', certPath)

// Verificar si existen los certificados
if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
  console.error('No se encontraron los certificados SSL.')
  console.error('Usando HTTP en su lugar...')
  
  // Iniciar servidor HTTP (sin SSL)
  app.listen(PORT, () => {
    console.log('Servidor backend corriendo en http://localhost:' + PORT)
    console.log('Listo para recibir peticiones en http://localhost:' + PORT + '/api/usuarios')
  })
} else {
  console.log('Certificados encontrados. Iniciando HTTPS...')
  
  const sslOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
  }

  // Iniciar servidor HTTPS
  https.createServer(sslOptions, app).listen(PORT, () => {
    console.log('Servidor HTTPS corriendo en https://localhost:' + PORT)
    console.log('Listo para recibir peticiones en https://localhost:' + PORT + '/api/usuarios')
  })
}