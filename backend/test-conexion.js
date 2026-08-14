const mysql = require('mysql2')

const db = mysql.createConnection({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '',
  database: 'petcard'
})

db.connect(err => {
  if (err) {
    console.error('ERROR:', err.code, err.message)
    process.exit(1)
  }
  console.log('✓ Conexión exitosa')
  db.end()
})