const selfsigned = require('selfsigned')
const fs = require('fs')
const path = require('path')

async function generarCertificados() {
  const attrs = [{ name: 'commonName', value: 'localhost' }]
  const pems = await selfsigned.generate(attrs, {
    days: 365,
    keySize: 2048,
    algorithm: 'sha256',
    extensions: [
      {
        name: 'subjectAltName',
        altNames: [
          { type: 2, value: 'localhost' }, // DNS
          { type: 7, ip: '127.0.0.1' }     // IP
        ]
      }
    ]
  })

  const certsDir = path.join(__dirname, 'certs')
  if (!fs.existsSync(certsDir)) fs.mkdirSync(certsDir)

  fs.writeFileSync(path.join(certsDir, 'cert.key'), pems.private)
  fs.writeFileSync(path.join(certsDir, 'cert.crt'), pems.cert)

  console.log('✓ Certificados generados en ./certs/cert.key y ./certs/cert.crt')
}

generarCertificados().catch(err => {
  console.error('Error generando certificados:', err.message)
  process.exit(1)
})