
const mysql = require('mysql2')
const bcrypt = require('bcrypt')
require('dotenv').config()

const db = mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petcard'
})

db.connect(async (err) => {
  if (err) {
    console.error('ERROR conectando a MySQL:', err.message)
    return
  }
  
  console.log('✓ Conectado a MySQL')
  console.log(' Iniciando encriptación de contraseñas...\n')

  try {
    // ===== ENCRIPTACION: Obtener todos los usuarios =====
    db.query('SELECT ID_usuario, Contrasena FROM usuario', async (err, usuarios) => {
      if (err) {
        console.error('Error al obtener usuarios:', err.message)
        db.end()
        return
      }

      let actualizadas = 0

      // ===== ENCRIPTACION: Hashear cada contraseña y actualizar =====
      for (let usuario of usuarios) {
        try {
          // Verificar si ya está hasheada (los hashes de bcrypt empiezan con $2)
          if (!usuario.Contrasena.startsWith('$2')) {
            const hash = await bcrypt.hash(usuario.Contrasena, 10)
            
            db.query(
              'UPDATE usuario SET Contrasena=? WHERE ID_usuario=?',
              [hash, usuario.ID_usuario],
              (err) => {
                if (err) {
                  console.error(` Error actualizando usuario ${usuario.ID_usuario}:`, err.message)
                } else {
                  console.log(`✓ Usuario ${usuario.ID_usuario} encriptado`)
                  actualizadas++
                }
              }
            )
          } else {
            console.log(` Usuario ${usuario.ID_usuario} ya está encriptado`)
          }
        } catch (error) {
          console.error(` Error al hashear usuario ${usuario.ID_usuario}:`, error.message)
        }
      }

      // Esperar un poco y mostrar resumen
      setTimeout(() => {
        console.log(`Proceso completado! ${actualizadas} contraseñas encriptadas con bcrypt`)
        console.log(' Todas las contraseñas ahora están seguras\n')
        db.end()
      }, 1000)
    })
  } catch (error) {
    console.error('Error fatal:', error)
    db.end()
  }
})
