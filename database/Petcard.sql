-- ================================================================
--  PETCARD - Esquema completo de base de datos
--  Reconstruido a partir de server.js y consultas.sql
--  (Petcard.sql original solo traia la tabla `usuario`)
-- ================================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS petcard CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE petcard;

-- ================================================================
-- 1. TABLA usuario (ya existia, se deja igual)
-- ================================================================
CREATE TABLE IF NOT EXISTS `usuario` (
  `ID_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(100) NOT NULL,
  `Correo` varchar(120) NOT NULL,
  `Telefono` varchar(20) DEFAULT NULL,
  `Contrasena` varchar(255) NOT NULL,
  `Rol` varchar(50) NOT NULL,
  PRIMARY KEY (`ID_usuario`),
  UNIQUE KEY `Correo` (`Correo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ================================================================
-- 2. TABLA cliente
-- ================================================================
CREATE TABLE IF NOT EXISTS `cliente` (
  `ID_cliente` int(11) NOT NULL AUTO_INCREMENT,
  `Direccion` varchar(255) DEFAULT NULL,
  `ID_usuario` int(11) NOT NULL,
  PRIMARY KEY (`ID_cliente`),
  KEY `ID_usuario` (`ID_usuario`),
  CONSTRAINT `fk_cliente_usuario` FOREIGN KEY (`ID_usuario`) REFERENCES `usuario` (`ID_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ================================================================
-- 3. TABLA veterinario
-- ================================================================
CREATE TABLE IF NOT EXISTS `veterinario` (
  `ID_veterinario` int(11) NOT NULL AUTO_INCREMENT,
  `Cargo` varchar(100) DEFAULT NULL,
  `Especialidad` varchar(100) DEFAULT NULL,
  `ID_usuario` int(11) NOT NULL,
  PRIMARY KEY (`ID_veterinario`),
  KEY `ID_usuario` (`ID_usuario`),
  CONSTRAINT `fk_veterinario_usuario` FOREIGN KEY (`ID_usuario`) REFERENCES `usuario` (`ID_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ================================================================
-- 4. TABLA administrador
-- ================================================================
CREATE TABLE IF NOT EXISTS `administrador` (
  `ID_administrador` int(11) NOT NULL AUTO_INCREMENT,
  `Cargo` varchar(100) DEFAULT NULL,
  `Area` varchar(100) DEFAULT NULL,
  `Permisos` varchar(255) DEFAULT NULL,
  `ID_usuario` int(11) NOT NULL,
  PRIMARY KEY (`ID_administrador`),
  KEY `ID_usuario` (`ID_usuario`),
  CONSTRAINT `fk_administrador_usuario` FOREIGN KEY (`ID_usuario`) REFERENCES `usuario` (`ID_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ================================================================
-- 5. TABLA servicio
-- ================================================================
CREATE TABLE IF NOT EXISTS `servicio` (
  `ID_servicio` int(11) NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(150) NOT NULL,
  `Descripcion` text DEFAULT NULL,
  `Categoria` varchar(100) DEFAULT NULL,
  `Precio` decimal(10,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`ID_servicio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ================================================================
-- 6. TABLA mascota
-- ================================================================
CREATE TABLE IF NOT EXISTS `mascota` (
  `ID_mascota` int(11) NOT NULL AUTO_INCREMENT,
  `ID_cliente` int(11) NOT NULL,
  `Fecha_nacimiento` date DEFAULT NULL,
  `Nombre` varchar(100) NOT NULL,
  `Especie` varchar(50) DEFAULT NULL,
  `Sexo` varchar(20) DEFAULT NULL,
  `Foto` varchar(255) DEFAULT NULL,
  `Raza` varchar(100) DEFAULT NULL,
  `Peso` decimal(6,2) DEFAULT NULL,
  PRIMARY KEY (`ID_mascota`),
  KEY `ID_cliente` (`ID_cliente`),
  CONSTRAINT `fk_mascota_cliente` FOREIGN KEY (`ID_cliente`) REFERENCES `cliente` (`ID_cliente`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ================================================================
-- 7. TABLA cita
-- ================================================================
CREATE TABLE IF NOT EXISTS `cita` (
  `ID_cita` int(11) NOT NULL AUTO_INCREMENT,
  `ID_cliente` int(11) NOT NULL,
  `ID_mascota` int(11) NOT NULL,
  `ID_servicio` int(11) NOT NULL,
  `ID_veterinario` int(11) NOT NULL,
  `Fecha` date NOT NULL,
  `Hora` time NOT NULL,
  `Motivo` varchar(255) DEFAULT NULL,
  `Observaciones` text DEFAULT NULL,
  PRIMARY KEY (`ID_cita`),
  KEY `ID_cliente` (`ID_cliente`),
  KEY `ID_mascota` (`ID_mascota`),
  KEY `ID_servicio` (`ID_servicio`),
  KEY `ID_veterinario` (`ID_veterinario`),
  CONSTRAINT `fk_cita_cliente` FOREIGN KEY (`ID_cliente`) REFERENCES `cliente` (`ID_cliente`) ON DELETE CASCADE,
  CONSTRAINT `fk_cita_mascota` FOREIGN KEY (`ID_mascota`) REFERENCES `mascota` (`ID_mascota`) ON DELETE CASCADE,
  CONSTRAINT `fk_cita_servicio` FOREIGN KEY (`ID_servicio`) REFERENCES `servicio` (`ID_servicio`) ON DELETE CASCADE,
  CONSTRAINT `fk_cita_veterinario` FOREIGN KEY (`ID_veterinario`) REFERENCES `veterinario` (`ID_veterinario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ================================================================
-- 8. TABLA carnetvacunas
-- ================================================================
CREATE TABLE IF NOT EXISTS `carnetvacunas` (
  `ID_carnetVacunas` int(11) NOT NULL AUTO_INCREMENT,
  `ID_mascota` int(11) NOT NULL,
  `ID_servicio` int(11) NOT NULL,
  `Nombre_vacuna` varchar(150) DEFAULT NULL,
  `Laboratorio` varchar(150) DEFAULT NULL,
  `Lote` varchar(100) DEFAULT NULL,
  `Fecha_aplicacion` date DEFAULT NULL,
  `Proxima_dosis` date DEFAULT NULL,
  `Estado` varchar(50) DEFAULT NULL,
  `Observaciones` text DEFAULT NULL,
  PRIMARY KEY (`ID_carnetVacunas`),
  KEY `ID_mascota` (`ID_mascota`),
  KEY `ID_servicio` (`ID_servicio`),
  CONSTRAINT `fk_carnet_mascota` FOREIGN KEY (`ID_mascota`) REFERENCES `mascota` (`ID_mascota`) ON DELETE CASCADE,
  CONSTRAINT `fk_carnet_servicio` FOREIGN KEY (`ID_servicio`) REFERENCES `servicio` (`ID_servicio`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ================================================================
-- 9. TABLA planalimentacion
-- ================================================================
CREATE TABLE IF NOT EXISTS `planalimentacion` (
  `ID_planAlimentacion` int(11) NOT NULL AUTO_INCREMENT,
  `ID_mascota` int(11) NOT NULL,
  `ID_servicio` int(11) NOT NULL,
  `Tipo_dieta` varchar(100) DEFAULT NULL,
  `Frecuencia` varchar(100) DEFAULT NULL,
  `Alergias` varchar(255) DEFAULT NULL,
  `Horario` varchar(100) DEFAULT NULL,
  `Calorias` int(11) DEFAULT NULL,
  `Suplementos` varchar(255) DEFAULT NULL,
  `Comidas` varchar(255) DEFAULT NULL,
  `Fecha_inicio` date DEFAULT NULL,
  `Fecha_fin` date DEFAULT NULL,
  `Observaciones` text DEFAULT NULL,
  `Diagnostico` text DEFAULT NULL,
  `Revision_nutricional` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ID_planAlimentacion`),
  KEY `ID_mascota` (`ID_mascota`),
  KEY `ID_servicio` (`ID_servicio`),
  CONSTRAINT `fk_plan_mascota` FOREIGN KEY (`ID_mascota`) REFERENCES `mascota` (`ID_mascota`) ON DELETE CASCADE,
  CONSTRAINT `fk_plan_servicio` FOREIGN KEY (`ID_servicio`) REFERENCES `servicio` (`ID_servicio`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ================================================================
-- 10. TABLA sistemacorreo (necesaria para notificacion.ID_sistemaCorreo)
-- ================================================================
CREATE TABLE IF NOT EXISTS `sistemacorreo` (
  `ID_sistemaCorreo` int(11) NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(100) DEFAULT NULL,
  `Protocolo` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`ID_sistemaCorreo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Seed obligatorio: server.js usa ID_sistemaCorreo = 1 como valor por defecto
INSERT INTO `sistemacorreo` (`ID_sistemaCorreo`, `Nombre`, `Protocolo`)
VALUES (1, 'Servidor Principal', 'SMTP')
ON DUPLICATE KEY UPDATE `Nombre` = VALUES(`Nombre`);

-- ================================================================
-- 11. TABLA notificacion
-- ================================================================
CREATE TABLE IF NOT EXISTS `notificacion` (
  `ID_notificacion` int(11) NOT NULL AUTO_INCREMENT,
  `ID_usuario` int(11) NOT NULL,
  `ID_sistemaCorreo` int(11) NOT NULL DEFAULT 1,
  `Mensaje` text DEFAULT NULL,
  `Tipo` varchar(50) DEFAULT NULL,
  `Canal` varchar(50) DEFAULT NULL,
  `Fecha_envio` datetime DEFAULT NULL,
  PRIMARY KEY (`ID_notificacion`),
  KEY `ID_usuario` (`ID_usuario`),
  KEY `ID_sistemaCorreo` (`ID_sistemaCorreo`),
  CONSTRAINT `fk_notificacion_usuario` FOREIGN KEY (`ID_usuario`) REFERENCES `usuario` (`ID_usuario`) ON DELETE CASCADE,
  CONSTRAINT `fk_notificacion_sistemacorreo` FOREIGN KEY (`ID_sistemaCorreo`) REFERENCES `sistemacorreo` (`ID_sistemaCorreo`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ================================================================
-- 12. TABLAS DE UNION (usadas solo en consultas.sql / reportes)
-- ================================================================
CREATE TABLE IF NOT EXISTS `administradorservicio` (
  `ID_administrador` int(11) NOT NULL,
  `ID_servicio` int(11) NOT NULL,
  PRIMARY KEY (`ID_administrador`, `ID_servicio`),
  CONSTRAINT `fk_adminserv_admin` FOREIGN KEY (`ID_administrador`) REFERENCES `administrador` (`ID_administrador`) ON DELETE CASCADE,
  CONSTRAINT `fk_adminserv_servicio` FOREIGN KEY (`ID_servicio`) REFERENCES `servicio` (`ID_servicio`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `veterinario_carnetvacunas` (
  `ID_veterinario` int(11) NOT NULL,
  `ID_carnetVacunas` int(11) NOT NULL,
  PRIMARY KEY (`ID_veterinario`, `ID_carnetVacunas`),
  CONSTRAINT `fk_vetcarnet_vet` FOREIGN KEY (`ID_veterinario`) REFERENCES `veterinario` (`ID_veterinario`) ON DELETE CASCADE,
  CONSTRAINT `fk_vetcarnet_carnet` FOREIGN KEY (`ID_carnetVacunas`) REFERENCES `carnetvacunas` (`ID_carnetVacunas`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `veterinario_planalimentacion` (
  `ID_veterinario` int(11) NOT NULL,
  `ID_planAlimentacion` int(11) NOT NULL,
  PRIMARY KEY (`ID_veterinario`, `ID_planAlimentacion`),
  CONSTRAINT `fk_vetplan_vet` FOREIGN KEY (`ID_veterinario`) REFERENCES `veterinario` (`ID_veterinario`) ON DELETE CASCADE,
  CONSTRAINT `fk_vetplan_plan` FOREIGN KEY (`ID_planAlimentacion`) REFERENCES `planalimentacion` (`ID_planAlimentacion`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ================================================================
-- 13. DATOS DE PRUEBA (usuario ya viene con datos del dump original)
-- ================================================================
INSERT INTO `usuario` (`ID_usuario`, `Nombre`, `Correo`, `Telefono`, `Contrasena`, `Rol`) VALUES
(1, 'Juan Perez', 'juan@gmail.com', '3001111111', '$2b$10$QnUv1Dugoyoa6jQqBLh3SenFCNtMQBRWV8gqDBhZiwH9SXZw/bfwa', 'cliente'),
(2, 'Maria Lopez', 'maria@gmail.com', '3002222222', '$2b$10$C3sxx/illhIHmPW3KMAQzuLOcT9BvpfhhiR0UMS4qud.78ggTw9zm', 'cliente'),
(3, 'Carlos Ruiz', 'carlos@gmail.com', '3003333333', '123456', 'cliente'),
(4, 'Dra. Laura Gomez', 'laura@gmail.com', '3004444444', '$2b$10$VnKte3/.16E/SPaJbeT69.Tb0DZeVRw3afp1YGFiqmy0GMWoJYf5m', 'veterinario'),
(5, 'Dr. Andres Torres', 'andres@gmail.com', '3005555555', '123456', 'veterinario'),
(6, 'Admin Principal', 'admin@gmail.com', '3215642023', '$2b$10$pNhUlGJoLk7ope.XSHsgsOmo1Ga1ZOcV3f05pDElV3TRrgarLz5b.', 'administrador'),
(7, 'yuber franco', 'yuberfranco@gmail.com', '3132849355', '123456', 'cliente'),
(8, 'YUBER FRANCO', 'yuberfranco4@gmail.com', '3158377547', '$2b$10$oXKU8F1CfFmPEAcxnnE6yubNHqMybc7/A0PNUyZUQlV5xr1SbBc7C', 'cliente')
ON DUPLICATE KEY UPDATE `Nombre` = VALUES(`Nombre`);

-- Vincula los usuarios existentes con su perfil segun su Rol
INSERT INTO `cliente` (`Direccion`, `ID_usuario`)
SELECT 'Direccion pendiente', ID_usuario FROM usuario
WHERE Rol = 'cliente' AND ID_usuario NOT IN (SELECT ID_usuario FROM cliente);

INSERT INTO `veterinario` (`Cargo`, `Especialidad`, `ID_usuario`)
SELECT 'Veterinario General', 'Medicina General', ID_usuario FROM usuario
WHERE Rol = 'veterinario' AND ID_usuario NOT IN (SELECT ID_usuario FROM veterinario);

INSERT INTO `administrador` (`Cargo`, `Area`, `Permisos`, `ID_usuario`)
SELECT 'Administrador General', 'Administracion', 'Control total del sistema', ID_usuario FROM usuario
WHERE Rol = 'administrador' AND ID_usuario NOT IN (SELECT ID_usuario FROM administrador);

-- Servicios de ejemplo
INSERT INTO `servicio` (`Nombre`, `Descripcion`, `Categoria`, `Precio`) VALUES
('Consulta general', 'Revision medica general de la mascota', 'Consulta', 50000.00),
('Vacunacion', 'Aplicacion de vacuna segun esquema', 'Prevencion', 45000.00),
('Cirugia menor', 'Procedimiento quirurgico ambulatorio', 'Cirugia', 250000.00),
('Plan nutricional', 'Diseno de plan de alimentacion', 'Nutricion', 60000.00)
ON DUPLICATE KEY UPDATE `Nombre` = VALUES(`Nombre`);

COMMIT;