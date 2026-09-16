// =============================================================
// Genera certificados SSL autofirmados para desarrollo local,
// sin depender de que OpenSSL esté instalado en el sistema.
//
// Uso:  node generar-certs.js
// =============================================================
const fs = require('fs')
const path = require('path')
const selfsigned = require('selfsigned')

async function main() {
  const certsDir = path.join(__dirname, 'certs')

  if (!fs.existsSync(certsDir)) {
    fs.mkdirSync(certsDir)
    console.log('📁 Carpeta certs/ creada.')
  }

  const attrs = [{ name: 'commonName', value: 'localhost' }]
  const pems = await selfsigned.generate(attrs, {
    days: 365,
    keySize: 2048
  })

  if (!pems || !pems.cert || !pems.private) {
    console.error('❌ No se pudo generar el certificado. Resultado:', pems)
    process.exit(1)
  }

  fs.writeFileSync(path.join(certsDir, 'cert.key'), pems.private)
  fs.writeFileSync(path.join(certsDir, 'cert.crt'), pems.cert)

  console.log('✅ Certificados generados en certs/cert.key y certs/cert.crt')
  console.log('   Válidos por 365 días, para localhost')
}

main().catch((err) => {
  console.error('❌ Error generando certificados:', err)
  process.exit(1)
})
