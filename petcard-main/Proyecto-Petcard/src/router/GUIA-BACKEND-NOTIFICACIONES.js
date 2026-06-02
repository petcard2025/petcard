/**
 * GUÍA: Implementación de API de Notificaciones en Backend
 * 
 * Este archivo contiene ejemplos de cómo implementar los endpoints
 * en el servidor (Node.js + Express) para que funcione con notificaciones.api.js
 */

// ===================================
// DEPENDENCIAS REQUERIDAS
// ===================================

/*
npm install express mysql2 cors dotenv

// package.json
{
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3"
  }
}
*/

// ===================================
// 1. CONFIGURACIÓN INICIAL (server.js)
// ===================================

/*
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Pool de conexiones a la BD
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petcard',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Importar rutas
const notificacionesRoutes = require('./routes/notificaciones.routes');

app.use('/api', notificacionesRoutes(pool));

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
*/

// ===================================
// 2. RUTAS (routes/notificaciones.routes.js)
// ===================================

/*
module.exports = (pool) => {
  const express = require('express');
  const router = express.Router();
  
  // GET - Obtener todas las notificaciones
  router.get('/notificaciones', async (req, res) => {
    try {
      const connection = await pool.getConnection();
      const [notificaciones] = await connection.query(
        'SELECT * FROM notificacion ORDER BY Fecha_envio DESC'
      );
      connection.release();
      res.json(notificaciones);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET - Notificaciones de un usuario
  router.get('/notificaciones/usuario/:idUsuario', async (req, res) => {
    try {
      const { idUsuario } = req.params;
      const connection = await pool.getConnection();
      const [notificaciones] = await connection.query(
        'SELECT * FROM notificacion WHERE ID_usuario = ? ORDER BY Fecha_envio DESC',
        [idUsuario]
      );
      connection.release();
      res.json(notificaciones);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET - Notificación por ID
  router.get('/notificaciones/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const connection = await pool.getConnection();
      const [notificaciones] = await connection.query(
        'SELECT * FROM notificacion WHERE ID_notificacion = ?',
        [id]
      );
      connection.release();
      
      if (notificaciones.length === 0) {
        return res.status(404).json({ error: 'Notificación no encontrada' });
      }
      
      res.json(notificaciones[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST - Crear notificación
  router.post('/notificaciones', async (req, res) => {
    try {
      const { ID_usuario, ID_sistemaCorreo, Mensaje, Tipo, Canal, Fecha_envio } = req.body;
      
      // Validar datos requeridos
      if (!ID_usuario || !ID_sistemaCorreo || !Mensaje || !Tipo || !Canal) {
        return res.status(400).json({ 
          error: 'Faltan campos requeridos' 
        });
      }
      
      const connection = await pool.getConnection();
      const fecha = Fecha_envio || new Date().toISOString();
      
      const [result] = await connection.query(
        'INSERT INTO notificacion (ID_usuario, ID_sistemaCorreo, Mensaje, Tipo, Canal, Fecha_envio) VALUES (?, ?, ?, ?, ?, ?)',
        [ID_usuario, ID_sistemaCorreo, Mensaje, Tipo, Canal, fecha]
      );
      
      connection.release();
      
      res.status(201).json({ 
        ID_notificacion: result.insertId,
        ID_usuario,
        ID_sistemaCorreo,
        Mensaje,
        Tipo,
        Canal,
        Fecha_envio: fecha
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST - Crear múltiples notificaciones
  router.post('/notificaciones/bulk', async (req, res) => {
    try {
      const { notificaciones } = req.body;
      
      if (!Array.isArray(notificaciones) || notificaciones.length === 0) {
        return res.status(400).json({ error: 'notificaciones debe ser un array no vacío' });
      }
      
      const connection = await pool.getConnection();
      const resultados = [];
      
      for (const notif of notificaciones) {
        const { ID_usuario, ID_sistemaCorreo, Mensaje, Tipo, Canal, Fecha_envio } = notif;
        const fecha = Fecha_envio || new Date().toISOString();
        
        const [result] = await connection.query(
          'INSERT INTO notificacion (ID_usuario, ID_sistemaCorreo, Mensaje, Tipo, Canal, Fecha_envio) VALUES (?, ?, ?, ?, ?, ?)',
          [ID_usuario, ID_sistemaCorreo, Mensaje, Tipo, Canal, fecha]
        );
        
        resultados.push({ ID_notificacion: result.insertId });
      }
      
      connection.release();
      res.status(201).json({ insertados: resultados.length, resultados });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // PUT - Actualizar notificación
  router.put('/notificaciones/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { Mensaje, Tipo, Canal } = req.body;
      
      const connection = await pool.getConnection();
      
      // Verificar que existe
      const [exists] = await connection.query(
        'SELECT * FROM notificacion WHERE ID_notificacion = ?',
        [id]
      );
      
      if (exists.length === 0) {
        connection.release();
        return res.status(404).json({ error: 'Notificación no encontrada' });
      }
      
      // Actualizar
      await connection.query(
        'UPDATE notificacion SET Mensaje = ?, Tipo = ?, Canal = ? WHERE ID_notificacion = ?',
        [Mensaje || exists[0].Mensaje, Tipo || exists[0].Tipo, Canal || exists[0].Canal, id]
      );
      
      connection.release();
      res.json({ ID_notificacion: id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // PATCH - Marcar como leída
  router.patch('/notificaciones/:id/marcar-como-leida', async (req, res) => {
    try {
      const { id } = req.params;
      const connection = await pool.getConnection();
      
      await connection.query(
        'UPDATE notificacion SET Leida = 1, Fecha_lectura = NOW() WHERE ID_notificacion = ?',
        [id]
      );
      
      connection.release();
      res.json({ ID_notificacion: id, Leida: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // PATCH - Marcar múltiples como leídas
  router.patch('/notificaciones/marcar-como-leidas/bulk', async (req, res) => {
    try {
      const { ids } = req.body;
      
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'ids debe ser un array no vacío' });
      }
      
      const connection = await pool.getConnection();
      const placeholders = ids.map(() => '?').join(',');
      
      await connection.query(
        `UPDATE notificacion SET Leida = 1, Fecha_lectura = NOW() WHERE ID_notificacion IN (${placeholders})`,
        ids
      );
      
      connection.release();
      res.json({ actualizadas: ids.length });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET - Notificaciones no leídas de un usuario
  router.get('/notificaciones/usuario/:idUsuario/no-leidas', async (req, res) => {
    try {
      const { idUsuario } = req.params;
      const connection = await pool.getConnection();
      const [notificaciones] = await connection.query(
        'SELECT * FROM notificacion WHERE ID_usuario = ? AND Leida = 0 ORDER BY Fecha_envio DESC',
        [idUsuario]
      );
      connection.release();
      res.json(notificaciones);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET - Notificaciones por tipo
  router.get('/notificaciones/tipo/:tipo', async (req, res) => {
    try {
      const { tipo } = req.params;
      const connection = await pool.getConnection();
      const [notificaciones] = await connection.query(
        'SELECT * FROM notificacion WHERE Tipo = ? ORDER BY Fecha_envio DESC',
        [tipo]
      );
      connection.release();
      res.json(notificaciones);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET - Notificaciones por canal
  router.get('/notificaciones/canal/:canal', async (req, res) => {
    try {
      const { canal } = req.params;
      const connection = await pool.getConnection();
      const [notificaciones] = await connection.query(
        'SELECT * FROM notificacion WHERE Canal = ? ORDER BY Fecha_envio DESC',
        [canal]
      );
      connection.release();
      res.json(notificaciones);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET - Notificaciones por rango de fechas
  router.get('/notificaciones/fecha/rango', async (req, res) => {
    try {
      const { fechaInicio, fechaFin } = req.query;
      
      if (!fechaInicio || !fechaFin) {
        return res.status(400).json({ error: 'Requiere fechaInicio y fechaFin' });
      }
      
      const connection = await pool.getConnection();
      const [notificaciones] = await connection.query(
        'SELECT * FROM notificacion WHERE DATE(Fecha_envio) BETWEEN ? AND ? ORDER BY Fecha_envio DESC',
        [fechaInicio, fechaFin]
      );
      connection.release();
      res.json(notificaciones);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET - Estadísticas generales
  router.get('/notificaciones/estadisticas', async (req, res) => {
    try {
      const connection = await pool.getConnection();
      const [stats] = await connection.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN Leida = 1 THEN 1 ELSE 0 END) as leidas,
          SUM(CASE WHEN Leida = 0 THEN 1 ELSE 0 END) as no_leidas
        FROM notificacion
      `);
      connection.release();
      res.json(stats[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET - Estadísticas por usuario
  router.get('/notificaciones/usuario/:idUsuario/estadisticas', async (req, res) => {
    try {
      const { idUsuario } = req.params;
      const connection = await pool.getConnection();
      const [stats] = await connection.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN Leida = 1 THEN 1 ELSE 0 END) as leidas,
          SUM(CASE WHEN Leida = 0 THEN 1 ELSE 0 END) as no_leidas
        FROM notificacion
        WHERE ID_usuario = ?
      `, [idUsuario]);
      connection.release();
      res.json(stats[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE - Eliminar notificación
  router.delete('/notificaciones/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const connection = await pool.getConnection();
      
      const [result] = await connection.query(
        'DELETE FROM notificacion WHERE ID_notificacion = ?',
        [id]
      );
      
      connection.release();
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Notificación no encontrada' });
      }
      
      res.json({ mensaje: 'Notificación eliminada', ID_notificacion: id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE - Eliminar múltiples notificaciones
  router.delete('/notificaciones/bulk', async (req, res) => {
    try {
      const { ids } = req.body;
      
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'ids debe ser un array no vacío' });
      }
      
      const connection = await pool.getConnection();
      const placeholders = ids.map(() => '?').join(',');
      
      const [result] = await connection.query(
        `DELETE FROM notificacion WHERE ID_notificacion IN (${placeholders})`,
        ids
      );
      
      connection.release();
      res.json({ eliminadas: result.affectedRows });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE - Eliminar todas las notificaciones de un usuario
  router.delete('/notificaciones/usuario/:idUsuario/todas', async (req, res) => {
    try {
      const { idUsuario } = req.params;
      const connection = await pool.getConnection();
      
      const [result] = await connection.query(
        'DELETE FROM notificacion WHERE ID_usuario = ?',
        [idUsuario]
      );
      
      connection.release();
      res.json({ eliminadas: result.affectedRows });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
*/

// ===================================
// 3. ESTRUCTURA DE BASE DE DATOS
// ===================================

/*
-- Tabla existente
CREATE TABLE notificacion (
  ID_notificacion int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  ID_usuario int(11) NOT NULL,
  ID_sistemaCorreo int(11) NOT NULL,
  Mensaje text,
  Tipo varchar(100),
  Canal varchar(100),
  Fecha_envio datetime DEFAULT CURRENT_TIMESTAMP,
  Leida tinyint(1) DEFAULT 0,
  Fecha_lectura datetime DEFAULT NULL,
  FOREIGN KEY (ID_usuario) REFERENCES usuario(ID_usuario) ON DELETE CASCADE
);

-- Índices para optimizar búsquedas
ALTER TABLE notificacion ADD INDEX idx_usuario (ID_usuario);
ALTER TABLE notificacion ADD INDEX idx_tipo (Tipo);
ALTER TABLE notificacion ADD INDEX idx_canal (Canal);
ALTER TABLE notificacion ADD INDEX idx_leida (Leida);
ALTER TABLE notificacion ADD INDEX idx_fecha (Fecha_envio);
*/

// ===================================
// 4. ARCHIVO .env
// ===================================

/*
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=petcard
PORT=3001
*/

// ===================================
// 5. VERIFICACIÓN DE FUNCIONAMIENTO
// ===================================

/*
// En Postman o terminal, prueba estos endpoints:

// 1. Ver todas las notificaciones
curl http://localhost:3001/api/notificaciones

// 2. Crear una notificación
curl -X POST http://localhost:3001/api/notificaciones \
  -H "Content-Type: application/json" \
  -d '{
    "ID_usuario": 1,
    "ID_sistemaCorreo": 1,
    "Mensaje": "Test notificación",
    "Tipo": "Recordatorio",
    "Canal": "Correo"
  }'

// 3. Obtener notificaciones de usuario 1
curl http://localhost:3001/api/notificaciones/usuario/1

// 4. Marcar como leída
curl -X PATCH http://localhost:3001/api/notificaciones/1/marcar-como-leida

// 5. Obtener estadísticas
curl http://localhost:3001/api/notificaciones/estadisticas
*/

// ===================================
// 6. CONSIDERACIONES IMPORTANTES
// ===================================

/*
✅ TODO LO QUE ESTÁ IMPLEMENTADO:

1. CRUD completo (Create, Read, Update, Delete)
2. Operaciones en lote (crear múltiples, marcar múltiples como leídas, eliminar múltiples)
3. Búsquedas por usuario, tipo, canal, rango de fechas
4. Estadísticas (generales y por usuario)
5. Manejo de errores con códigos HTTP apropuados
6. Validación de datos requeridos
7. Índices en la base de datos para optimización

⚠️ PRÓXIMAS MEJORAS SUGERIDAS:

1. Autenticación y autorización (JWT)
2. Paginación en listados
3. Rate limiting
4. Notificaciones en tiempo real (WebSockets)
5. Envío real de emails/SMS
6. Soft delete (marcar como eliminado sin borrar de la BD)
7. Campos adicionales (prioridad, destinatarios adicionales)

🔐 SEGURIDAD:

- Validar siempre los datos de entrada
- Usar prepared statements (ya están siendo usados)
- Implementar autenticación
- Limitar acceso a datos del usuario
- Usar HTTPS en producción
*/
