-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 18-06-2026 a las 08:25:06
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `petcard`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `administrador`
--

CREATE TABLE `administrador` (
  `ID_administrador` int(11) NOT NULL COMMENT 'Identificador único del administrador.',
  `Cargo` varchar(100) DEFAULT NULL COMMENT 'Cargo que desempeña el administrador dentro de la veterinaria.',
  `Area` varchar(100) DEFAULT NULL COMMENT 'Área de trabajo del administrador.',
  `Permisos` varchar(255) DEFAULT NULL COMMENT 'Permisos o privilegios asignados dentro del sistema.',
  `ID_usuario` int(11) NOT NULL COMMENT 'Relación con la tabla usuario para asociar los datos generales del administrador.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `administrador`
--

INSERT INTO `administrador` (`ID_administrador`, `Cargo`, `Area`, `Permisos`, `ID_usuario`) VALUES
(1, 'Administrador General', 'Administración', 'Control total del sistema', 6);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `administradorservicio`
--

CREATE TABLE `administradorservicio` (
  `ID_adminServicio` int(11) NOT NULL COMMENT 'Identificador único de la relación.',
  `ID_servicio` int(11) NOT NULL COMMENT 'Servicio administrado.',
  `ID_administrador` int(11) NOT NULL COMMENT 'Administrador responsable del servicio.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `administradorservicio`
--

INSERT INTO `administradorservicio` (`ID_adminServicio`, `ID_servicio`, `ID_administrador`) VALUES
(1, 1, 1),
(2, 2, 1),
(3, 3, 1),
(4, 4, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carnetvacunas`
--

CREATE TABLE `carnetvacunas` (
  `ID_carnetVacunas` int(11) NOT NULL COMMENT 'Identificador único del registro de vacunación.',
  `ID_mascota` int(11) NOT NULL COMMENT 'Mascota vacunada.',
  `ID_servicio` int(11) NOT NULL COMMENT 'Servicio de vacunación asociado.',
  `Nombre_vacuna` varchar(120) DEFAULT NULL COMMENT 'Nombre de la vacuna aplicada.',
  `Laboratorio` varchar(120) DEFAULT NULL COMMENT 'Laboratorio fabricante de la vacuna.',
  `Lote` varchar(100) DEFAULT NULL COMMENT 'Número de lote de la vacuna.',
  `Fecha_aplicacion` date DEFAULT NULL COMMENT 'Fecha en que se aplicó la vacuna.',
  `Proxima_dosis` date DEFAULT NULL COMMENT 'Fecha de la siguiente dosis.',
  `Reacciones` text DEFAULT NULL COMMENT 'Reacciones adversas presentadas.',
  `Estado` varchar(100) DEFAULT NULL COMMENT 'Estado del esquema de vacunación.',
  `Observaciones` text DEFAULT NULL COMMENT 'Observaciones adicionales.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `carnetvacunas`
--

INSERT INTO `carnetvacunas` (`ID_carnetVacunas`, `ID_mascota`, `ID_servicio`, `Nombre_vacuna`, `Laboratorio`, `Lote`, `Fecha_aplicacion`, `Proxima_dosis`, `Reacciones`, `Estado`, `Observaciones`) VALUES
(1, 1, 2, 'Antirrábica', 'Zoetis', 'A123', '2026-02-21', '2027-02-21', 'Ninguna', 'Completo', 'Vacuna aplicada correctamente'),
(2, 2, 2, 'Triple Felina', 'Pfizer', 'B456', '2026-02-21', '2027-02-21', 'Leve fiebre', 'En proceso', 'Control en 3 días');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cita`
--

CREATE TABLE `cita` (
  `ID_cita` int(11) NOT NULL COMMENT 'Identificador único de la cita.',
  `ID_cliente` int(11) NOT NULL COMMENT 'Cliente que solicita la cita.',
  `ID_mascota` int(11) NOT NULL COMMENT 'Mascota que será atendida.',
  `ID_servicio` int(11) NOT NULL COMMENT 'Servicio que se realizará en la cita.',
  `ID_veterinario` int(11) NOT NULL COMMENT 'Veterinario asignado a la cita.',
  `Fecha` date DEFAULT NULL COMMENT 'Fecha programada de la cita.',
  `Hora` time DEFAULT NULL COMMENT 'Hora programada de la cita.',
  `Motivo` varchar(255) DEFAULT NULL COMMENT 'Motivo principal de la consulta.',
  `Observaciones` text DEFAULT NULL COMMENT 'Notas adicionales de la cita.',
  `Google_Event_ID` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cita`
--

INSERT INTO `cita` (`ID_cita`, `ID_cliente`, `ID_mascota`, `ID_servicio`, `ID_veterinario`, `Fecha`, `Hora`, `Motivo`, `Observaciones`, `Google_Event_ID`) VALUES
(1, 1, 1, 1, 1, '2026-02-20', '10:00:00', 'Chequeo general', 'Sin novedades', NULL),
(2, 1, 2, 2, 1, '2026-02-21', '11:00:00', 'Vacunación anual', 'Aplicar refuerzo', NULL),
(3, 2, 3, 4, 2, '2026-02-22', '09:30:00', 'Desparasitación', 'Control mensual', NULL),
(4, 3, 4, 1, 1, '2026-02-23', '14:00:00', 'Consulta digestiva', 'Presenta vómito', NULL),
(5, 1, 1, 1, 1, '2026-05-25', '10:00:00', 'Vacunación anual', 'Prueba Google Calendar', 'ngp0ulha5p959ti7si7v69n5dc'),
(6, 1, 2, 1, 2, '2026-05-29', '08:00:00', 'Consulta General', 'np', NULL),
(7, 1, 2, 3, 1, '2026-05-23', '11:00:00', 'Cirugía Esterilización', 'hacer la esterilizacion', NULL),
(8, 1, 2, 3, 1, '2026-05-23', '11:00:00', 'cirugia esterilizacion', 'Prueba Google Calendar', NULL),
(9, 1, 2, 3, 1, '2026-05-23', '11:00:00', 'Cirugia Esterilizacion', 'hacer la esterilizacion', NULL),
(10, 1, 2, 3, 1, '2026-05-23', '11:00:00', 'Cirugia Esterilizacion', 'hacer la esterilizacion', NULL),
(11, 1, 2, 3, 1, '2026-05-23', '11:00:00', 'Cirugia Esterilizacion', 'hacer la esterilizacion', NULL),
(12, 1, 2, 3, 1, '2026-05-23', '11:00:00', 'Cirugia Esterilizacion', 'hacer la esterilizacion', '55ofdsgd9d77inq0h29b41e0i4'),
(13, 1, 1, 1, 1, '2026-06-10', '10:00:00', 'Chequeo general', 'Prueba con Google Calendar', 'o9eua4gmrdiaj4lcgqqe2o0o68'),
(14, 1, 2, 3, 1, '2026-06-15', '11:00:00', 'Cirugía Esterilización', 'Prueba Google Calendar', 'u1icteq2h0mmae91vbmu1qh2s0'),
(16, 1, 2, 3, 1, '2026-05-23', '11:00:00', 'Cirugía Esterilizacion', 'hacer la esterilizacion', 'q5pappnbo7ipa4aoh62fd2vfl4'),
(17, 1, 2, 3, 1, '2026-05-23', '11:00:00', 'Cirugía Esterilizacion', 'hacer la esterilizacion', 'k14semrbqg0p5f3165ct60cdr0');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cliente`
--

CREATE TABLE `cliente` (
  `ID_cliente` int(11) NOT NULL COMMENT 'Identificador único del cliente.',
  `Direccion` varchar(255) DEFAULT NULL COMMENT 'Dirección de residencia del cliente.',
  `ID_usuario` int(11) NOT NULL COMMENT 'Relación con la tabla usuario para los datos personales y de acceso.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cliente`
--

INSERT INTO `cliente` (`ID_cliente`, `Direccion`, `ID_usuario`) VALUES
(1, 'Calle 10 #20-30 Bogotá', 1),
(2, 'Carrera 15 #30-40 Cali', 2),
(3, 'Av 80 #45-60 Medellín', 3),
(4, '', 6);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mascota`
--

CREATE TABLE `mascota` (
  `ID_mascota` int(11) NOT NULL COMMENT 'Identificador único de la mascota.',
  `ID_cliente` int(11) NOT NULL COMMENT 'Identifica al dueño de la mascota.',
  `Fecha_nacimiento` date DEFAULT NULL COMMENT 'Fecha de nacimiento de la mascota.',
  `Nombre` varchar(100) DEFAULT NULL COMMENT 'Nombre de la mascota.',
  `Especie` varchar(100) DEFAULT NULL COMMENT 'Tipo de animal (perro, gato, etc.).',
  `Sexo` varchar(10) DEFAULT NULL COMMENT 'Sexo biológico de la mascota.',
  `Foto` varchar(255) DEFAULT NULL COMMENT 'uta o enlace de la imagen de la mascota.',
  `Raza` varchar(120) DEFAULT NULL COMMENT 'Raza de la mascota.\r\n',
  `Peso` decimal(5,2) DEFAULT NULL COMMENT 'Peso actual de la mascota.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `mascota`
--

INSERT INTO `mascota` (`ID_mascota`, `ID_cliente`, `Fecha_nacimiento`, `Nombre`, `Especie`, `Sexo`, `Foto`, `Raza`, `Peso`) VALUES
(1, 1, '2020-05-10', 'Max', 'Perro', 'Macho', 'max.jpg', 'Labrador', 25.50),
(2, 1, '2021-03-15', 'Luna', 'Gato', 'Hembra', 'luna.jpg', 'Siames', 4.20),
(3, 2, '2019-07-20', 'Rocky', 'Perro', 'Macho', 'rocky.jpg', 'Bulldog', 18.00),
(4, 3, '2022-01-05', 'Milo', 'Gato', 'Macho', 'milo.jpg', 'Criollo', 3.80),
(5, 1, '2024-05-10', 'dester', 'Perro', 'Macho', 'foto.png', 'golden', 49.70);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificacion`
--

CREATE TABLE `notificacion` (
  `ID_notificacion` int(11) NOT NULL COMMENT 'Identificador único de la notificación.',
  `ID_usuario` int(11) NOT NULL COMMENT 'Usuario que recibe la notificación.',
  `ID_sistemaCorreo` int(11) NOT NULL COMMENT 'Sistema por el cual se envía la notificación.',
  `Mensaje` text DEFAULT NULL COMMENT 'Contenido del mensaje enviado.',
  `Tipo` varchar(100) DEFAULT NULL COMMENT 'Tipo de notificación (recordatorio, alerta, confirmación).',
  `Canal` varchar(100) DEFAULT NULL COMMENT 'Medio de envío (correo, SMS, sistema).',
  `Fecha_envio` datetime DEFAULT NULL COMMENT 'Fecha y hora del envío.',
  `Leida` tinyint(1) DEFAULT 0,
  `Fecha_lectura` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `notificacion`
--

INSERT INTO `notificacion` (`ID_notificacion`, `ID_usuario`, `ID_sistemaCorreo`, `Mensaje`, `Tipo`, `Canal`, `Fecha_envio`, `Leida`, `Fecha_lectura`) VALUES
(1, 1, 1, 'Recordatorio de vacuna para Max', 'Recordatorio', 'Correo', '2026-02-18 21:40:19', 0, NULL),
(2, 2, 2, 'Confirmación de cita', 'Confirmación', 'Correo', '2026-02-18 21:40:19', 0, NULL),
(3, 7, 1, 'su perro esta ue se muere\n', 'Alerta', 'SMS', '2026-05-21 07:05:46', 0, NULL),
(4, 7, 1, 'la mascota', 'Alerta', 'SMS', '2026-05-21 07:11:54', 0, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `planalimentacion`
--

CREATE TABLE `planalimentacion` (
  `ID_planAlimentacion` int(11) NOT NULL COMMENT 'Identificador único del plan alimenticio.\r\n',
  `ID_mascota` int(11) NOT NULL COMMENT 'Mascota a la que se le asigna el plan.',
  `ID_servicio` int(11) NOT NULL COMMENT 'Servicio relacionado con el plan alimenticio.',
  `Tipo_dieta` varchar(100) DEFAULT NULL COMMENT 'Tipo de dieta recomendada.',
  `Frecuencia` varchar(100) DEFAULT NULL COMMENT 'Frecuencia de alimentación.',
  `Alergias` text DEFAULT NULL COMMENT 'Alergias alimentarias detectadas.',
  `Horario` varchar(100) DEFAULT NULL COMMENT 'Horario recomendado de alimentación.',
  `Calorias` int(11) DEFAULT NULL COMMENT 'Cantidad calórica diaria recomendada.',
  `Suplementos` text DEFAULT NULL COMMENT 'Suplementos nutricionales recomendados.',
  `Comidas` text DEFAULT NULL COMMENT 'Tipo de alimentos incluidos en la dieta.',
  `Fecha_inicio` date DEFAULT NULL COMMENT 'Fecha de inicio del plan.',
  `Fecha_fin` date DEFAULT NULL COMMENT 'Fecha de finalización del plan.',
  `Observaciones` text DEFAULT NULL COMMENT 'Observaciones adicionales del plan.',
  `Diagnostico` text DEFAULT NULL COMMENT 'Diagnóstico nutricional de la mascota.',
  `Revision_nutricional` text DEFAULT NULL COMMENT 'Resultados de revisiones posteriores.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `planalimentacion`
--

INSERT INTO `planalimentacion` (`ID_planAlimentacion`, `ID_mascota`, `ID_servicio`, `Tipo_dieta`, `Frecuencia`, `Alergias`, `Horario`, `Calorias`, `Suplementos`, `Comidas`, `Fecha_inicio`, `Fecha_fin`, `Observaciones`, `Diagnostico`, `Revision_nutricional`) VALUES
(1, 1, 1, 'Balanceada', '2 veces al día', 'Ninguna', '8am - 6pm', 1200, 'Vitaminas', 'Concentrado premium', '2026-02-20', '2026-08-20', 'Buen estado', 'Sobrepeso leve', 'Control en 3 meses'),
(2, 3, 4, 'Especial digestiva', '3 veces al día', 'Pollo', '7am - 1pm - 7pm', 900, 'Probióticos', 'Dieta blanda', '2026-02-22', '2026-05-22', 'En observación', 'Problema digestivo', 'Mejora progresiva');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `servicio`
--

CREATE TABLE `servicio` (
  `ID_servicio` int(11) NOT NULL COMMENT 'Identificador único del servicio.',
  `Nombre` varchar(120) DEFAULT NULL COMMENT 'Nombre del servicio ofrecido.',
  `Descripcion` text DEFAULT NULL COMMENT 'Descripción detallada del servicio.',
  `Categoria` varchar(100) DEFAULT NULL COMMENT 'Clasificación del servicio (consulta, vacuna, cirugía, etc.).',
  `Precio` decimal(10,2) DEFAULT NULL COMMENT 'Costo del servicio.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `servicio`
--

INSERT INTO `servicio` (`ID_servicio`, `Nombre`, `Descripcion`, `Categoria`, `Precio`) VALUES
(1, 'Consulta General', 'Revisión médica básica', 'Consulta', 80000.00),
(2, 'Vacuna Antirrábica', 'Aplicación vacuna contra rabia', 'Vacuna', 50000.00),
(3, 'Cirugía Esterilización', 'Procedimiento quirúrgico', 'Cirugía', 300000.00),
(4, 'Desparasitación', 'Tratamiento antiparasitario', 'Tratamiento', 40000.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sistemacorreo`
--

CREATE TABLE `sistemacorreo` (
  `ID_sistemaCorreo` int(11) NOT NULL COMMENT 'Identificador del sistema de correo.',
  `Protocolo` varchar(100) DEFAULT NULL COMMENT 'Protocolo usado para el envío de correos (SMTP, API, etc.).',
  `Nombre` varchar(100) DEFAULT NULL COMMENT 'Nombre del sistema de correo.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `sistemacorreo`
--

INSERT INTO `sistemacorreo` (`ID_sistemaCorreo`, `Protocolo`, `Nombre`) VALUES
(1, 'SMTP', 'Gmail SMTP'),
(2, 'API', 'SendGrid');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `ID_usuario` int(11) NOT NULL COMMENT 'Identificador único del usuario dentro del sistema.',
  `Nombre` varchar(100) NOT NULL COMMENT 'Nombre completo del usuario.',
  `Correo` varchar(120) NOT NULL COMMENT 'Correo electrónico del usuario, usado para inicio de sesión y notificaciones.',
  `Telefono` varchar(20) DEFAULT NULL COMMENT 'Número de contacto del usuario.',
  `Contrasena` varchar(255) NOT NULL COMMENT 'Contraseña encriptada para acceder al sistema.',
  `Rol` varchar(50) NOT NULL COMMENT 'Define el tipo de usuario (administrador, veterinario o cliente).'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`ID_usuario`, `Nombre`, `Correo`, `Telefono`, `Contrasena`, `Rol`) VALUES
(1, 'Juan Perez', 'juan@gmail.com', '3001111111', '$2b$10$QnUv1Dugoyoa6jQqBLh3SenFCNtMQBRWV8gqDBhZiwH9SXZw/bfwa', 'cliente'),
(2, 'Maria Lopez', 'maria@gmail.com', '3002222222', '$2b$10$C3sxx/illhIHmPW3KMAQzuLOcT9BvpfhhiR0UMS4qud.78ggTw9zm', 'cliente'),
(3, 'Carlos Ruiz', 'carlos@gmail.com', '3003333333', '123456', 'cliente'),
(4, 'Dra. Laura Gomez', 'laura@gmail.com', '3004444444', '123456', 'veterinario'),
(5, 'Dr. Andres Torres', 'andres@gmail.com', '3005555555', '123456', 'veterinario'),
(6, 'Admin Principal', 'admin@gmail.com', '3215642023', '$2b$10$iaQyGPlaAfwy8a4vZRZYReksD9kJ1i1fZb/wgW2tQs.791UdhWxwe', 'administrador'),
(7, 'yuber franco', 'yuberfranco@gmail.com', '3132849355', '123456', 'cliente');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `veterinario`
--

CREATE TABLE `veterinario` (
  `ID_veterinario` int(11) NOT NULL COMMENT 'Identificador único del veterinario.',
  `Cargo` varchar(100) DEFAULT NULL COMMENT 'Cargo del veterinario dentro de la clínica.',
  `Especialidad` varchar(100) DEFAULT NULL COMMENT 'Especialidad médica del veterinario.',
  `ID_usuario` int(11) NOT NULL COMMENT 'Relación con la tabla usuario para asociar los datos de acceso y contacto.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `veterinario`
--

INSERT INTO `veterinario` (`ID_veterinario`, `Cargo`, `Especialidad`, `ID_usuario`) VALUES
(1, 'Veterinario General', 'Medicina Interna', 4),
(2, 'Veterinario Cirujano', 'Cirugía Animal', 5);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `veterinario_carnetvacunas`
--

CREATE TABLE `veterinario_carnetvacunas` (
  `ID_veterinarioCarnetVacunas` int(11) NOT NULL COMMENT 'Identificador de la relación.',
  `ID_veterinario` int(11) NOT NULL COMMENT 'Veterinario que aplica la vacuna.',
  `ID_carnetVacunas` int(11) NOT NULL COMMENT 'Registro de vacunación realizado.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `veterinario_carnetvacunas`
--

INSERT INTO `veterinario_carnetvacunas` (`ID_veterinarioCarnetVacunas`, `ID_veterinario`, `ID_carnetVacunas`) VALUES
(1, 1, 1),
(2, 1, 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `veterinario_planalimentacion`
--

CREATE TABLE `veterinario_planalimentacion` (
  `ID_veterinarioPlanAlimentacion` int(11) NOT NULL COMMENT 'Identificador de la relación.',
  `ID_veterinario` int(11) NOT NULL COMMENT 'Veterinario que asigna el plan.',
  `ID_planAlimentacion` int(11) NOT NULL COMMENT 'Plan alimenticio asignado.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `veterinario_planalimentacion`
--

INSERT INTO `veterinario_planalimentacion` (`ID_veterinarioPlanAlimentacion`, `ID_veterinario`, `ID_planAlimentacion`) VALUES
(1, 1, 1),
(2, 2, 2);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `administrador`
--
ALTER TABLE `administrador`
  ADD PRIMARY KEY (`ID_administrador`),
  ADD KEY `ID_usuario` (`ID_usuario`);

--
-- Indices de la tabla `administradorservicio`
--
ALTER TABLE `administradorservicio`
  ADD PRIMARY KEY (`ID_adminServicio`),
  ADD KEY `ID_servicio` (`ID_servicio`),
  ADD KEY `ID_administrador` (`ID_administrador`);

--
-- Indices de la tabla `carnetvacunas`
--
ALTER TABLE `carnetvacunas`
  ADD PRIMARY KEY (`ID_carnetVacunas`),
  ADD KEY `ID_mascota` (`ID_mascota`),
  ADD KEY `ID_servicio` (`ID_servicio`);

--
-- Indices de la tabla `cita`
--
ALTER TABLE `cita`
  ADD PRIMARY KEY (`ID_cita`),
  ADD KEY `ID_cliente` (`ID_cliente`),
  ADD KEY `ID_mascota` (`ID_mascota`),
  ADD KEY `ID_servicio` (`ID_servicio`),
  ADD KEY `ID_veterinario` (`ID_veterinario`);

--
-- Indices de la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD PRIMARY KEY (`ID_cliente`),
  ADD KEY `ID_usuario` (`ID_usuario`);

--
-- Indices de la tabla `mascota`
--
ALTER TABLE `mascota`
  ADD PRIMARY KEY (`ID_mascota`),
  ADD KEY `ID_cliente` (`ID_cliente`);

--
-- Indices de la tabla `notificacion`
--
ALTER TABLE `notificacion`
  ADD PRIMARY KEY (`ID_notificacion`),
  ADD KEY `ID_usuario` (`ID_usuario`),
  ADD KEY `ID_sistemaCorreo` (`ID_sistemaCorreo`);

--
-- Indices de la tabla `planalimentacion`
--
ALTER TABLE `planalimentacion`
  ADD PRIMARY KEY (`ID_planAlimentacion`),
  ADD KEY `ID_mascota` (`ID_mascota`),
  ADD KEY `ID_servicio` (`ID_servicio`);

--
-- Indices de la tabla `servicio`
--
ALTER TABLE `servicio`
  ADD PRIMARY KEY (`ID_servicio`);

--
-- Indices de la tabla `sistemacorreo`
--
ALTER TABLE `sistemacorreo`
  ADD PRIMARY KEY (`ID_sistemaCorreo`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`ID_usuario`),
  ADD UNIQUE KEY `Correo` (`Correo`);

--
-- Indices de la tabla `veterinario`
--
ALTER TABLE `veterinario`
  ADD PRIMARY KEY (`ID_veterinario`),
  ADD KEY `ID_usuario` (`ID_usuario`);

--
-- Indices de la tabla `veterinario_carnetvacunas`
--
ALTER TABLE `veterinario_carnetvacunas`
  ADD PRIMARY KEY (`ID_veterinarioCarnetVacunas`),
  ADD KEY `ID_veterinario` (`ID_veterinario`),
  ADD KEY `ID_carnetVacunas` (`ID_carnetVacunas`);

--
-- Indices de la tabla `veterinario_planalimentacion`
--
ALTER TABLE `veterinario_planalimentacion`
  ADD PRIMARY KEY (`ID_veterinarioPlanAlimentacion`),
  ADD KEY `ID_veterinario` (`ID_veterinario`),
  ADD KEY `ID_planAlimentacion` (`ID_planAlimentacion`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `administrador`
--
ALTER TABLE `administrador`
  MODIFY `ID_administrador` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del administrador.', AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `administradorservicio`
--
ALTER TABLE `administradorservicio`
  MODIFY `ID_adminServicio` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único de la relación.', AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `carnetvacunas`
--
ALTER TABLE `carnetvacunas`
  MODIFY `ID_carnetVacunas` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del registro de vacunación.', AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `cita`
--
ALTER TABLE `cita`
  MODIFY `ID_cita` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único de la cita.', AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de la tabla `cliente`
--
ALTER TABLE `cliente`
  MODIFY `ID_cliente` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del cliente.', AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `mascota`
--
ALTER TABLE `mascota`
  MODIFY `ID_mascota` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único de la mascota.', AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `notificacion`
--
ALTER TABLE `notificacion`
  MODIFY `ID_notificacion` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único de la notificación.', AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `planalimentacion`
--
ALTER TABLE `planalimentacion`
  MODIFY `ID_planAlimentacion` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del plan alimenticio.\r\n', AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `servicio`
--
ALTER TABLE `servicio`
  MODIFY `ID_servicio` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del servicio.', AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `sistemacorreo`
--
ALTER TABLE `sistemacorreo`
  MODIFY `ID_sistemaCorreo` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador del sistema de correo.', AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `ID_usuario` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del usuario dentro del sistema.', AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `veterinario`
--
ALTER TABLE `veterinario`
  MODIFY `ID_veterinario` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del veterinario.', AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `veterinario_carnetvacunas`
--
ALTER TABLE `veterinario_carnetvacunas`
  MODIFY `ID_veterinarioCarnetVacunas` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador de la relación.', AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `veterinario_planalimentacion`
--
ALTER TABLE `veterinario_planalimentacion`
  MODIFY `ID_veterinarioPlanAlimentacion` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador de la relación.', AUTO_INCREMENT=3;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `administrador`
--
ALTER TABLE `administrador`
  ADD CONSTRAINT `administrador_ibfk_1` FOREIGN KEY (`ID_usuario`) REFERENCES `usuario` (`ID_usuario`);

--
-- Filtros para la tabla `administradorservicio`
--
ALTER TABLE `administradorservicio`
  ADD CONSTRAINT `administradorservicio_ibfk_1` FOREIGN KEY (`ID_servicio`) REFERENCES `servicio` (`ID_servicio`),
  ADD CONSTRAINT `administradorservicio_ibfk_2` FOREIGN KEY (`ID_administrador`) REFERENCES `administrador` (`ID_administrador`);

--
-- Filtros para la tabla `carnetvacunas`
--
ALTER TABLE `carnetvacunas`
  ADD CONSTRAINT `carnetvacunas_ibfk_1` FOREIGN KEY (`ID_mascota`) REFERENCES `mascota` (`ID_mascota`),
  ADD CONSTRAINT `carnetvacunas_ibfk_2` FOREIGN KEY (`ID_servicio`) REFERENCES `servicio` (`ID_servicio`);

--
-- Filtros para la tabla `cita`
--
ALTER TABLE `cita`
  ADD CONSTRAINT `cita_ibfk_1` FOREIGN KEY (`ID_cliente`) REFERENCES `cliente` (`ID_cliente`),
  ADD CONSTRAINT `cita_ibfk_2` FOREIGN KEY (`ID_mascota`) REFERENCES `mascota` (`ID_mascota`),
  ADD CONSTRAINT `cita_ibfk_3` FOREIGN KEY (`ID_servicio`) REFERENCES `servicio` (`ID_servicio`),
  ADD CONSTRAINT `cita_ibfk_4` FOREIGN KEY (`ID_veterinario`) REFERENCES `veterinario` (`ID_veterinario`);

--
-- Filtros para la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD CONSTRAINT `cliente_ibfk_1` FOREIGN KEY (`ID_usuario`) REFERENCES `usuario` (`ID_usuario`);

--
-- Filtros para la tabla `mascota`
--
ALTER TABLE `mascota`
  ADD CONSTRAINT `mascota_ibfk_1` FOREIGN KEY (`ID_cliente`) REFERENCES `cliente` (`ID_cliente`);

--
-- Filtros para la tabla `notificacion`
--
ALTER TABLE `notificacion`
  ADD CONSTRAINT `notificacion_ibfk_1` FOREIGN KEY (`ID_usuario`) REFERENCES `usuario` (`ID_usuario`),
  ADD CONSTRAINT `notificacion_ibfk_2` FOREIGN KEY (`ID_sistemaCorreo`) REFERENCES `sistemacorreo` (`ID_sistemaCorreo`);

--
-- Filtros para la tabla `planalimentacion`
--
ALTER TABLE `planalimentacion`
  ADD CONSTRAINT `planalimentacion_ibfk_1` FOREIGN KEY (`ID_mascota`) REFERENCES `mascota` (`ID_mascota`),
  ADD CONSTRAINT `planalimentacion_ibfk_2` FOREIGN KEY (`ID_servicio`) REFERENCES `servicio` (`ID_servicio`);

--
-- Filtros para la tabla `veterinario`
--
ALTER TABLE `veterinario`
  ADD CONSTRAINT `veterinario_ibfk_1` FOREIGN KEY (`ID_usuario`) REFERENCES `usuario` (`ID_usuario`);

--
-- Filtros para la tabla `veterinario_carnetvacunas`
--
ALTER TABLE `veterinario_carnetvacunas`
  ADD CONSTRAINT `veterinario_carnetvacunas_ibfk_1` FOREIGN KEY (`ID_veterinario`) REFERENCES `veterinario` (`ID_veterinario`),
  ADD CONSTRAINT `veterinario_carnetvacunas_ibfk_2` FOREIGN KEY (`ID_carnetVacunas`) REFERENCES `carnetvacunas` (`ID_carnetVacunas`);

--
-- Filtros para la tabla `veterinario_planalimentacion`
--
ALTER TABLE `veterinario_planalimentacion`
  ADD CONSTRAINT `veterinario_planalimentacion_ibfk_1` FOREIGN KEY (`ID_veterinario`) REFERENCES `veterinario` (`ID_veterinario`),
  ADD CONSTRAINT `veterinario_planalimentacion_ibfk_2` FOREIGN KEY (`ID_planAlimentacion`) REFERENCES `planalimentacion` (`ID_planAlimentacion`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
