-- ================================================================
-- PETCARD - ESQUEMA COMPLETO
-- Firebase Authentication + MySQL
-- ================================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- ================================================================
-- 1. BASE DE DATOS
-- ================================================================

CREATE DATABASE IF NOT EXISTS petcard
CHARACTER SET utf8mb4
COLLATE utf8mb4_general_ci;

USE petcard;


-- ================================================================
-- 2. TABLA usuario
--
-- Firebase se encarga de:
--   - correo
--   - contraseña
--   - autenticación
--
-- MySQL se encarga de:
--   - datos del usuario
--   - rol
--   - relaciones con cliente/veterinario/administrador
--
-- firebase_uid relaciona Firebase con MySQL.
-- ================================================================

CREATE TABLE IF NOT EXISTS usuario (
    ID_usuario INT(11) NOT NULL AUTO_INCREMENT,
    Nombre VARCHAR(100) NOT NULL,
    Correo VARCHAR(120) NOT NULL,
    Telefono VARCHAR(20) DEFAULT NULL,

    -- Ya no es necesaria para usuarios autenticados
    -- mediante Firebase.
    Contrasena VARCHAR(255) DEFAULT NULL,

    Rol VARCHAR(50) NOT NULL,

    -- UID único generado por Firebase Authentication.
    firebase_uid VARCHAR(128) DEFAULT NULL,

    PRIMARY KEY (ID_usuario),

    UNIQUE KEY uq_usuario_correo (Correo),

    UNIQUE KEY uq_usuario_firebase_uid (firebase_uid)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;


-- ================================================================
-- 3. TABLA cliente
-- ================================================================

CREATE TABLE IF NOT EXISTS cliente (
    ID_cliente INT(11) NOT NULL AUTO_INCREMENT,
    Direccion VARCHAR(255) DEFAULT NULL,
    ID_usuario INT(11) NOT NULL,

    PRIMARY KEY (ID_cliente),

    KEY ID_usuario (ID_usuario),

    CONSTRAINT fk_cliente_usuario
        FOREIGN KEY (ID_usuario)
        REFERENCES usuario (ID_usuario)
        ON DELETE CASCADE

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;


-- ================================================================
-- 4. TABLA veterinario
-- ================================================================

CREATE TABLE IF NOT EXISTS veterinario (
    ID_veterinario INT(11) NOT NULL AUTO_INCREMENT,
    Cargo VARCHAR(100) DEFAULT NULL,
    Especialidad VARCHAR(100) DEFAULT NULL,
    ID_usuario INT(11) NOT NULL,

    PRIMARY KEY (ID_veterinario),

    KEY ID_usuario (ID_usuario),

    CONSTRAINT fk_veterinario_usuario
        FOREIGN KEY (ID_usuario)
        REFERENCES usuario (ID_usuario)
        ON DELETE CASCADE

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;


-- ================================================================
-- 5. TABLA administrador
-- ================================================================

CREATE TABLE IF NOT EXISTS administrador (
    ID_administrador INT(11) NOT NULL AUTO_INCREMENT,
    Cargo VARCHAR(100) DEFAULT NULL,
    Area VARCHAR(100) DEFAULT NULL,
    Permisos VARCHAR(255) DEFAULT NULL,
    ID_usuario INT(11) NOT NULL,

    PRIMARY KEY (ID_administrador),

    KEY ID_usuario (ID_usuario),

    CONSTRAINT fk_administrador_usuario
        FOREIGN KEY (ID_usuario)
        REFERENCES usuario (ID_usuario)
        ON DELETE CASCADE

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;


-- ================================================================
-- 6. TABLA servicio
-- ================================================================

CREATE TABLE IF NOT EXISTS servicio (
    ID_servicio INT(11) NOT NULL AUTO_INCREMENT,
    Nombre VARCHAR(150) NOT NULL,
    Descripcion TEXT DEFAULT NULL,
    Categoria VARCHAR(100) DEFAULT NULL,
    Precio DECIMAL(10,2) NOT NULL DEFAULT 0.00,

    PRIMARY KEY (ID_servicio)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;


-- ================================================================
-- 7. TABLA mascota
-- ================================================================

CREATE TABLE IF NOT EXISTS mascota (
    ID_mascota INT(11) NOT NULL AUTO_INCREMENT,
    ID_cliente INT(11) NOT NULL,
    Fecha_nacimiento DATE DEFAULT NULL,
    Nombre VARCHAR(100) NOT NULL,
    Especie VARCHAR(50) DEFAULT NULL,
    Sexo VARCHAR(20) DEFAULT NULL,
    Foto VARCHAR(255) DEFAULT NULL,
    Raza VARCHAR(100) DEFAULT NULL,
    Peso DECIMAL(6,2) DEFAULT NULL,

    PRIMARY KEY (ID_mascota),

    KEY ID_cliente (ID_cliente),

    CONSTRAINT fk_mascota_cliente
        FOREIGN KEY (ID_cliente)
        REFERENCES cliente (ID_cliente)
        ON DELETE CASCADE

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;


-- ================================================================
-- 8. TABLA cita
-- ================================================================

CREATE TABLE IF NOT EXISTS cita (
    ID_cita INT(11) NOT NULL AUTO_INCREMENT,
    ID_cliente INT(11) NOT NULL,
    ID_mascota INT(11) NOT NULL,
    ID_servicio INT(11) NOT NULL,
    ID_veterinario INT(11) NOT NULL,
    Fecha DATE NOT NULL,
    Hora TIME NOT NULL,
    Motivo VARCHAR(255) DEFAULT NULL,
    Observaciones TEXT DEFAULT NULL,

    PRIMARY KEY (ID_cita),

    KEY ID_cliente (ID_cliente),
    KEY ID_mascota (ID_mascota),
    KEY ID_servicio (ID_servicio),
    KEY ID_veterinario (ID_veterinario),

    CONSTRAINT fk_cita_cliente
        FOREIGN KEY (ID_cliente)
        REFERENCES cliente (ID_cliente)
        ON DELETE CASCADE,

    CONSTRAINT fk_cita_mascota
        FOREIGN KEY (ID_mascota)
        REFERENCES mascota (ID_mascota)
        ON DELETE CASCADE,

    CONSTRAINT fk_cita_servicio
        FOREIGN KEY (ID_servicio)
        REFERENCES servicio (ID_servicio)
        ON DELETE CASCADE,

    CONSTRAINT fk_cita_veterinario
        FOREIGN KEY (ID_veterinario)
        REFERENCES veterinario (ID_veterinario)
        ON DELETE CASCADE

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;


-- ================================================================
-- 9. TABLA carnetvacunas
-- ================================================================

CREATE TABLE IF NOT EXISTS carnetvacunas (
    ID_carnetVacunas INT(11) NOT NULL AUTO_INCREMENT,
    ID_mascota INT(11) NOT NULL,
    ID_servicio INT(11) NOT NULL,
    Nombre_vacuna VARCHAR(150) DEFAULT NULL,
    Laboratorio VARCHAR(150) DEFAULT NULL,
    Lote VARCHAR(100) DEFAULT NULL,
    Fecha_aplicacion DATE DEFAULT NULL,
    Proxima_dosis DATE DEFAULT NULL,
    Estado VARCHAR(50) DEFAULT NULL,
    Observaciones TEXT DEFAULT NULL,

    PRIMARY KEY (ID_carnetVacunas),

    KEY ID_mascota (ID_mascota),
    KEY ID_servicio (ID_servicio),

    CONSTRAINT fk_carnet_mascota
        FOREIGN KEY (ID_mascota)
        REFERENCES mascota (ID_mascota)
        ON DELETE CASCADE,

    CONSTRAINT fk_carnet_servicio
        FOREIGN KEY (ID_servicio)
        REFERENCES servicio (ID_servicio)
        ON DELETE CASCADE

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;


-- ================================================================
-- 10. TABLA planalimentacion
-- ================================================================

CREATE TABLE IF NOT EXISTS planalimentacion (
    ID_planAlimentacion INT(11) NOT NULL AUTO_INCREMENT,
    ID_mascota INT(11) NOT NULL,
    ID_servicio INT(11) NOT NULL,
    Tipo_dieta VARCHAR(100) DEFAULT NULL,
    Frecuencia VARCHAR(100) DEFAULT NULL,
    Alergias VARCHAR(255) DEFAULT NULL,
    Horario VARCHAR(100) DEFAULT NULL,
    Calorias INT(11) DEFAULT NULL,
    Suplementos VARCHAR(255) DEFAULT NULL,
    Comidas VARCHAR(255) DEFAULT NULL,
    Fecha_inicio DATE DEFAULT NULL,
    Fecha_fin DATE DEFAULT NULL,
    Observaciones TEXT DEFAULT NULL,
    Diagnostico TEXT DEFAULT NULL,
    Revision_nutricional VARCHAR(255) DEFAULT NULL,

    PRIMARY KEY (ID_planAlimentacion),

    KEY ID_mascota (ID_mascota),
    KEY ID_servicio (ID_servicio),

    CONSTRAINT fk_plan_mascota
        FOREIGN KEY (ID_mascota)
        REFERENCES mascota (ID_mascota)
        ON DELETE CASCADE,

    CONSTRAINT fk_plan_servicio
        FOREIGN KEY (ID_servicio)
        REFERENCES servicio (ID_servicio)
        ON DELETE CASCADE

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;


-- ================================================================
-- 11. TABLA sistemacorreo
-- ================================================================

CREATE TABLE IF NOT EXISTS sistemacorreo (
    ID_sistemaCorreo INT(11) NOT NULL AUTO_INCREMENT,
    Nombre VARCHAR(100) DEFAULT NULL,
    Protocolo VARCHAR(50) DEFAULT NULL,

    PRIMARY KEY (ID_sistemaCorreo)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;


-- ================================================================
-- 12. DATOS DEL SISTEMA DE CORREO
-- ================================================================

INSERT INTO sistemacorreo
(
    ID_sistemaCorreo,
    Nombre,
    Protocolo
)
VALUES
(
    1,
    'Servidor Principal',
    'SMTP'
)
ON DUPLICATE KEY UPDATE
    Nombre = VALUES(Nombre);


-- ================================================================
-- 13. TABLA notificacion
-- ================================================================

CREATE TABLE IF NOT EXISTS notificacion (
    ID_notificacion INT(11) NOT NULL AUTO_INCREMENT,
    ID_usuario INT(11) NOT NULL,
    ID_sistemaCorreo INT(11) NOT NULL DEFAULT 1,
    Mensaje TEXT DEFAULT NULL,
    Tipo VARCHAR(50) DEFAULT NULL,
    Canal VARCHAR(50) DEFAULT NULL,
    Fecha_envio DATETIME DEFAULT NULL,

    PRIMARY KEY (ID_notificacion),

    KEY ID_usuario (ID_usuario),
    KEY ID_sistemaCorreo (ID_sistemaCorreo),

    CONSTRAINT fk_notificacion_usuario
        FOREIGN KEY (ID_usuario)
        REFERENCES usuario (ID_usuario)
        ON DELETE CASCADE,

    CONSTRAINT fk_notificacion_sistemacorreo
        FOREIGN KEY (ID_sistemaCorreo)
        REFERENCES sistemacorreo (ID_sistemaCorreo)
        ON DELETE CASCADE

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;


-- ================================================================
-- 14. TABLA administradorservicio
-- ================================================================

CREATE TABLE IF NOT EXISTS administradorservicio (
    ID_administrador INT(11) NOT NULL,
    ID_servicio INT(11) NOT NULL,

    PRIMARY KEY (ID_administrador, ID_servicio),

    CONSTRAINT fk_adminserv_admin
        FOREIGN KEY (ID_administrador)
        REFERENCES administrador (ID_administrador)
        ON DELETE CASCADE,

    CONSTRAINT fk_adminserv_servicio
        FOREIGN KEY (ID_servicio)
        REFERENCES servicio (ID_servicio)
        ON DELETE CASCADE

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;


-- ================================================================
-- 15. TABLA veterinario_carnetvacunas
-- ================================================================

CREATE TABLE IF NOT EXISTS veterinario_carnetvacunas (
    ID_veterinario INT(11) NOT NULL,
    ID_carnetVacunas INT(11) NOT NULL,

    PRIMARY KEY (ID_veterinario, ID_carnetVacunas),

    CONSTRAINT fk_vetcarnet_vet
        FOREIGN KEY (ID_veterinario)
        REFERENCES veterinario (ID_veterinario)
        ON DELETE CASCADE,

    CONSTRAINT fk_vetcarnet_carnet
        FOREIGN KEY (ID_carnetVacunas)
        REFERENCES carnetvacunas (ID_carnetVacunas)
        ON DELETE CASCADE

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;


-- ================================================================
-- 16. TABLA veterinario_planalimentacion
-- ================================================================

CREATE TABLE IF NOT EXISTS veterinario_planalimentacion (
    ID_veterinario INT(11) NOT NULL,
    ID_planAlimentacion INT(11) NOT NULL,

    PRIMARY KEY (ID_veterinario, ID_planAlimentacion),

    CONSTRAINT fk_vetplan_vet
        FOREIGN KEY (ID_veterinario)
        REFERENCES veterinario (ID_veterinario)
        ON DELETE CASCADE,

    CONSTRAINT fk_vetplan_plan
        FOREIGN KEY (ID_planAlimentacion)
        REFERENCES planalimentacion (ID_planAlimentacion)
        ON DELETE CASCADE

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;


-- ================================================================
-- 17. USUARIOS DE PRUEBA
--
-- Los usuarios antiguos no tienen firebase_uid porque todavía
-- no están vinculados a Firebase.
-- ================================================================

INSERT INTO usuario
(
    ID_usuario,
    Nombre,
    Correo,
    Telefono,
    Contrasena,
    Rol,
    firebase_uid
)
VALUES
(
    1,
    'Juan Perez',
    'juan@gmail.com',
    '3001111111',
    '$2b$10$QnUv1Dugoyoa6jQqBLh3SenFCNtMQBRWV8gqDBhZiwH9SXZw/bfwa',
    'cliente',
    NULL
),
(
    2,
    'Maria Lopez',
    'maria@gmail.com',
    '3002222222',
    '$2b$10$C3sxx/illhIHmPW3KMAQzuLOcT9BvpfhhiR0UMS4qud.78ggTw9zm',
    'cliente',
    NULL
),
(
    3,
    'Carlos Ruiz',
    'carlos@gmail.com',
    '3003333333',
    '123456',
    'cliente',
    NULL
),
(
    4,
    'Dra. Laura Gomez',
    'laura@gmail.com',
    '3004444444',
    '$2b$10$VnKte3/.16E/SPaJbeT69.Tb0DZeVRw3afp1YGFiqmy0GMWoJYf5m',
    'veterinario',
    NULL
),
(
    5,
    'Dr. Andres Torres',
    'andres@gmail.com',
    '3005555555',
    '123456',
    'veterinario',
    NULL
),
(
    6,
    'Admin Principal',
    'admin@gmail.com',
    '3215642023',
    '$2b$10$pNhUlGJoLk7ope.XSHsgsOmo1Ga1ZOcV3f05pDElV3TRrgarLz5b.',
    'administrador',
    NULL
),
(
    7,
    'yuber franco',
    'yuberfranco@gmail.com',
    '3132849355',
    '123456',
    'cliente',
    NULL
),
(
    8,
    'YUBER FRANCO',
    'yuberfranco4@gmail.com',
    '3158377547',
    '$2b$10$oXKU8F1CfFmPEAcxnnE6yubNHqMybc7/A0PNUyZUQlV5xr1SbBc7C',
    'cliente',
    NULL
)
ON DUPLICATE KEY UPDATE
    Nombre = VALUES(Nombre);


-- ================================================================
-- 18. CREAR PERFIL DE CLIENTE
-- ================================================================

INSERT INTO cliente
(
    Direccion,
    ID_usuario
)
SELECT
    'Direccion pendiente',
    u.ID_usuario
FROM usuario u
WHERE u.Rol = 'cliente'
AND NOT EXISTS (
    SELECT 1
    FROM cliente c
    WHERE c.ID_usuario = u.ID_usuario
);


-- ================================================================
-- 19. CREAR PERFIL DE VETERINARIO
-- ================================================================

INSERT INTO veterinario
(
    Cargo,
    Especialidad,
    ID_usuario
)
SELECT
    'Veterinario General',
    'Medicina General',
    u.ID_usuario
FROM usuario u
WHERE u.Rol = 'veterinario'
AND NOT EXISTS (
    SELECT 1
    FROM veterinario v
    WHERE v.ID_usuario = u.ID_usuario
);


-- ================================================================
-- 20. CREAR PERFIL DE ADMINISTRADOR
-- ================================================================

INSERT INTO administrador
(
    Cargo,
    Area,
    Permisos,
    ID_usuario
)
SELECT
    'Administrador General',
    'Administracion',
    'Control total del sistema',
    u.ID_usuario
FROM usuario u
WHERE u.Rol = 'administrador'
AND NOT EXISTS (
    SELECT 1
    FROM administrador a
    WHERE a.ID_usuario = u.ID_usuario
);


-- ================================================================
-- 21. SERVICIOS DE EJEMPLO
-- ================================================================

INSERT INTO servicio
(
    Nombre,
    Descripcion,
    Categoria,
    Precio
)
VALUES
(
    'Consulta general',
    'Revision medica general de la mascota',
    'Consulta',
    50000.00
),
(
    'Vacunacion',
    'Aplicacion de vacuna segun esquema',
    'Prevencion',
    45000.00
),
(
    'Cirugia menor',
    'Procedimiento quirurgico ambulatorio',
    'Cirugia',
    250000.00
),
(
    'Plan nutricional',
    'Diseno de plan de alimentacion',
    'Nutricion',
    60000.00
)
ON DUPLICATE KEY UPDATE
    Nombre = VALUES(Nombre);


-- ================================================================
-- 22. FINALIZAR
-- ================================================================

COMMIT;