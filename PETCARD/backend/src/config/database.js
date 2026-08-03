// CONEXION A MYSQL
const mysql = require('mysql2')
require('dotenv').config()

const db = mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petcard',
  charset: 'utf8mb4'
})

db.connect(err => {
  if (err) {
    console.error('ERROR conectando a MySQL:', err.message)
    console.error('Asegurate que MySQL este corriendo en XAMPP')
    return
  }
  console.log('Conectado a MySQL correctamente')
})

module.exports = db