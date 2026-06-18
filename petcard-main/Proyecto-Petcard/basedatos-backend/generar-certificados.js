// Genera certificados SSL autofirmados para desarrollo local.
// Se guardan en ./certs (carpeta ignorada por git, ver .gitignore).
// Cada desarrollador debe correr este script una vez en su maquina:
//
//   npm run certs
//
// Nunca subas los archivos generados (certs/) al repositorio.

const mkcert = require('mkcert')
const fs = require('fs')
const path = require('path')

async function main() {
  const certsDir = path.join(__dirname, 'certs')
  if (!fs.existsSync(certsDir)) {
    fs.mkdirSync(certsDir)
  }

  console.log('Generando certificado SSL local para desarrollo...')

  const ca = await mkcert.createCA({
    organization: 'PetCard Dev CA',
    countryCode: 'CO',
    state: 'Bogota',
    locality: 'Bogota',
    validity: 365
  })

  const cert = await mkcert.createCert({
    domains: ['127.0.0.1', 'localhost'],
    validity: 365,
    ca: { key: ca.key, cert: ca.cert }
  })

  fs.writeFileSync(path.join(certsDir, 'ca.key'), ca.key)
  fs.writeFileSync(path.join(certsDir, 'ca.crt'), ca.cert)
  fs.writeFileSync(path.join(certsDir, 'cert.key'), cert.key)
  fs.writeFileSync(path.join(certsDir, 'cert.crt'), cert.cert)

  console.log('Certificados generados en ./certs (no se suben a git)')
  console.log('Si tu navegador muestra advertencia de seguridad, es normal: son certificados')
  console.log('autofirmados solo para desarrollo local. Para quitar la advertencia puedes')
  console.log('importar ./certs/ca.crt como autoridad confiable en tu sistema operativo.')
}

main().catch(err => {
  console.error('Error generando certificados:', err.message)
  process.exit(1)
})
