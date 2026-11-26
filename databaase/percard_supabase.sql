-- ============================================================
-- Esquema PetCard convertido de MySQL/MariaDB a PostgreSQL
-- Generado para usar en Supabase (SQL Editor)
-- ============================================================

--




--
-- Base de datos: petcard
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla administrador
--

CREATE TABLE administrador (
  ID_administrador INTEGER NOT NULL,
  Cargo varchar(100) DEFAULT NULL,
  Area varchar(100) DEFAULT NULL,
  Permisos varchar(255) DEFAULT NULL,
  ID_usuario INTEGER NOT NULL
);

--
-- Volcado de datos para la tabla administrador
--

INSERT INTO administrador (ID_administrador, Cargo, Area, Permisos, ID_usuario) VALUES
(1, 'Administrador General', 'Administración', 'Control total del sistema', 6);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla administradorservicio
--

CREATE TABLE administradorservicio (
  ID_adminServicio INTEGER NOT NULL,
  ID_servicio INTEGER NOT NULL,
  ID_administrador INTEGER NOT NULL
);

--
-- Volcado de datos para la tabla administradorservicio
--

INSERT INTO administradorservicio (ID_adminServicio, ID_servicio, ID_administrador) VALUES
(1, 1, 1),
(2, 2, 1),
(3, 3, 1),
(4, 4, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla carnetvacunas
--

CREATE TABLE carnetvacunas (
  ID_carnetVacunas INTEGER NOT NULL,
  ID_mascota INTEGER NOT NULL,
  ID_servicio INTEGER NOT NULL,
  Nombre_vacuna varchar(120) DEFAULT NULL,
  Laboratorio varchar(120) DEFAULT NULL,
  Lote varchar(100) DEFAULT NULL,
  Fecha_aplicacion date DEFAULT NULL,
  Proxima_dosis date DEFAULT NULL,
  Reacciones text DEFAULT NULL,
  Estado varchar(100) DEFAULT NULL,
  Observaciones text DEFAULT NULL
);

--
-- Volcado de datos para la tabla carnetvacunas
--

INSERT INTO carnetvacunas (ID_carnetVacunas, ID_mascota, ID_servicio, Nombre_vacuna, Laboratorio, Lote, Fecha_aplicacion, Proxima_dosis, Reacciones, Estado, Observaciones) VALUES
(1, 1, 2, 'Antirrábica', 'Zoetis', 'A123', '2026-02-21', '2027-02-21', 'Ninguna', 'Completada', 'Vacuna aplicada correctamente'),
(2, 2, 2, 'Triple Felina', 'Pfizer', 'B456', '2026-02-21', '2027-02-21', 'Leve fiebre', 'En proceso', 'Control en 3 días'),
(3, 3, 2, 'Leucemia Felina', NULL, 'a2222', '2026-07-03', '2026-07-11', NULL, 'Completo', 'dcdd'),
(4, 13, 2, 'Leptospirosis', NULL, 'bdfhdh', '2026-07-27', '2026-07-29', NULL, 'Aplicada', 'fbzdfh');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla cita
--

CREATE TABLE cita (
  ID_cita INTEGER NOT NULL,
  ID_cliente INTEGER NOT NULL,
  ID_mascota INTEGER NOT NULL,
  ID_servicio INTEGER NOT NULL,
  ID_veterinario INTEGER NOT NULL,
  Fecha date DEFAULT NULL,
  Hora time DEFAULT NULL,
  Motivo varchar(255) DEFAULT NULL,
  Observaciones text DEFAULT NULL,
  Estado varchar(20) NOT NULL DEFAULT 'Pendiente',
  Google_Event_ID varchar(255) DEFAULT NULL
);

--
-- Volcado de datos para la tabla cita
--

INSERT INTO cita (ID_cita, ID_cliente, ID_mascota, ID_servicio, ID_veterinario, Fecha, Hora, Motivo, Observaciones, Estado, Google_Event_ID) VALUES
(1, 1, 1, 1, 1, '2026-02-20', '10:00:00', 'Chequeo general', 'Sin novedades', 'Pendiente', NULL),
(2, 1, 2, 2, 1, '2026-02-21', '11:00:00', 'Vacunación anual', 'Aplicar refuerzo', 'Pendiente', NULL),
(3, 2, 3, 4, 2, '2026-02-22', '09:30:00', 'Desparasitación', 'Control mensual', 'Pendiente', NULL),
(4, 3, 4, 1, 1, '2026-02-23', '14:00:00', 'Consulta digestiva', 'Presenta vómito', 'Pendiente', NULL),
(5, 1, 1, 1, 1, '2026-05-25', '10:00:00', 'Vacunación anual', 'Prueba Google Calendar', 'Pendiente', 'ngp0ulha5p959ti7si7v69n5dc'),
(6, 1, 2, 1, 2, '2026-05-29', '08:00:00', 'Consulta General', 'np', 'Pendiente', NULL),
(7, 1, 2, 3, 1, '2026-05-23', '11:00:00', 'Cirugía Esterilización', 'hacer la esterilizacion', 'Pendiente', NULL),
(8, 1, 2, 3, 1, '2026-05-23', '11:00:00', 'cirugia esterilizacion', 'Prueba Google Calendar', 'Pendiente', NULL),
(9, 1, 2, 3, 1, '2026-05-23', '11:00:00', 'Cirugia Esterilizacion', 'hacer la esterilizacion', 'Pendiente', NULL),
(10, 1, 2, 3, 1, '2026-05-23', '11:00:00', 'Cirugia Esterilizacion', 'hacer la esterilizacion', 'Pendiente', NULL),
(11, 1, 2, 3, 1, '2026-05-23', '11:00:00', 'Cirugia Esterilizacion', 'hacer la esterilizacion', 'Pendiente', NULL),
(12, 1, 2, 3, 1, '2026-05-23', '11:00:00', 'Cirugia Esterilizacion', 'hacer la esterilizacion', 'Pendiente', '55ofdsgd9d77inq0h29b41e0i4'),
(13, 1, 1, 1, 1, '2026-06-10', '10:00:00', 'Chequeo general', 'Prueba con Google Calendar', 'Pendiente', 'o9eua4gmrdiaj4lcgqqe2o0o68'),
(14, 1, 2, 3, 1, '2026-06-15', '11:00:00', 'Cirugía Esterilización', 'Prueba Google Calendar', 'Pendiente', 'u1icteq2h0mmae91vbmu1qh2s0'),
(16, 1, 2, 3, 1, '2026-05-23', '11:00:00', 'Cirugía Esterilizacion', 'hacer la esterilizacion', 'Pendiente', 'q5pappnbo7ipa4aoh62fd2vfl4'),
(17, 1, 2, 3, 1, '2026-05-23', '11:00:00', 'Cirugía Esterilizacion', 'hacer la esterilizacion', 'Pendiente', 'k14semrbqg0p5f3165ct60cdr0'),
(18, 1, 1, 1, 1, '2026-07-02', '04:00:00', 'Consulta General', '', 'Cancelada', NULL),
(19, 5, 7, 2, 1, '2026-07-03', '04:00:00', 'Vacuna Antirrábica', '', 'Pendiente', NULL),
(20, 5, 7, 2, 1, '2026-07-01', '10:00:00', 'Vacuna Antirrábica', '', 'Pendiente', NULL),
(21, 5, 7, 1, 1, '2026-07-11', '03:00:00', 'Consulta General', '', 'Pendiente', 'uffcpht0ig8g3v8vor49inbmb8'),
(22, 1, 1, 1, 1, '2026-06-25', '08:00:00', 'Consulta General', '', 'Pendiente', 'bkqb5rf6rgv2nt8n4n997behvs'),
(23, 1, 2, 2, 1, '2026-06-25', '08:00:00', 'Vacuna Antirrábica', '', 'Pendiente', '1u513bgcs08cli9lg9b4phd0io'),
(24, 1, 8, 3, 1, '2026-06-25', '08:00:00', 'Cirugía Esterilización', '', 'Pendiente', '8c1su3ep9hg2qce3on9ls4cgns'),
(25, 1, 8, 2, 2, '2026-06-27', '04:00:00', 'Vacuna Antirrábica', '', 'Cancelada', 'fsnfpn0ospgcdrn0s0ke6jqfuo'),
(26, 1, 2, 2, 1, '2026-06-27', '04:00:00', 'Vacuna Antirrábica', '', 'Pendiente', 'hrka14gsvg9b3e4cqebtusfm30'),
(27, 1, 1, 2, 1, '2026-06-27', '04:00:00', 'Vacuna Antirrábica', '', 'Pendiente', '47ohqrlqbmdva3fen4kon3sk2k'),
(28, 1, 8, 2, 1, '2026-06-27', '04:00:00', 'Vacuna Antirrábica', '', 'Pendiente', '60k6nj3t31ace7ga6oh4rnk95g'),
(29, 5, 7, 2, 1, '2026-07-01', '08:00:00', 'Vacuna Antirrábica', '', 'Pendiente', NULL),
(30, 5, 10, 3, 1, '2026-07-09', '08:00:00', 'Cirugía Esterilización', '', 'Pendiente', NULL),
(31, 2, 3, 2, 1, '2026-06-30', '09:00:00', 'Vacuna Antirrábica', '', 'Pendiente', NULL),
(32, 1, 1, 1, 1, '2026-06-30', '08:00:00', 'Consulta General', '', 'Cancelada', NULL),
(33, 5, 12, 1, 1, '2026-07-03', '08:00:00', 'Consulta General', '', 'Pendiente', NULL),
(35, 5, 13, 2, 2, '2026-07-31', '11:00:00', 'Vacuna Antirrábica', '', 'Pendiente', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla cliente
--

CREATE TABLE cliente (
  ID_cliente INTEGER NOT NULL,
  Direccion varchar(255) DEFAULT NULL,
  ID_usuario INTEGER NOT NULL
);

--
-- Volcado de datos para la tabla cliente
--

INSERT INTO cliente (ID_cliente, Direccion, ID_usuario) VALUES
(1, 'Calle 10 #20-30 Bogotá', 1),
(2, 'Carrera 15 #30-40 Cali', 2),
(3, 'Av 80 #45-60 Medellín', 3),
(4, '', 6),
(5, '', 8),
(6, 'Calle 123', 1),
(7, '', 4),
(8, '', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla mascota
--

CREATE TABLE mascota (
  ID_mascota INTEGER NOT NULL,
  ID_cliente INTEGER NOT NULL,
  Fecha_nacimiento date DEFAULT NULL,
  Nombre varchar(100) DEFAULT NULL,
  Especie varchar(100) DEFAULT NULL,
  Sexo varchar(10) DEFAULT NULL,
  Foto varchar(255) DEFAULT NULL,
  Raza varchar(120) DEFAULT NULL,
  Peso decimal(5,2) DEFAULT NULL,
  Estado varchar(20) NOT NULL DEFAULT 'activo'
);

--
-- Volcado de datos para la tabla mascota
--

INSERT INTO mascota (ID_mascota, ID_cliente, Fecha_nacimiento, Nombre, Especie, Sexo, Foto, Raza, Peso, Estado) VALUES
(1, 1, '2020-05-10', 'Max', 'Perro', 'Macho', 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAJQAmAMBIgACEQEDEQH/', 'Labrador', 25.50, 'activo'),
(2, 1, '2021-03-15', 'Luna', 'Gato', 'Hembra', 'luna.jpg', 'Siames', 4.20, 'activo'),
(3, 2, '2019-07-20', 'Rocky', 'Perro', 'Macho', 'rocky.jpg', 'Bulldog', 18.00, 'activo'),
(4, 3, '2022-01-05', 'Milo', 'Gato', 'Macho', 'milo.jpg', 'Criollo', 3.80, 'activo'),
(5, 1, '2024-05-10', 'dester', 'Perro', 'Macho', 'foto.png', 'golden', 49.70, 'inactivo'),
(6, 5, '2025-04-09', 'loki', 'Gato', 'Macho', 'imagen.png', 'gato', 20.00, 'inactivo'),
(7, 5, '2025-02-10', 'loki 2', 'Gato', 'Macho', 'imagen.png', 'gato', 50.00, 'inactivo'),
(8, 1, '2026-06-25', 'loki', 'Perro', 'Macho', 'imagen.png', 'golden', 20.00, 'activo'),
(9, 1, '2020-05-10', 'Max', 'Perro', 'Macho', '', 'Labrador', 25.50, 'activo'),
(10, 5, '2025-02-10', 'hehe', 'Gato', 'Macho', '', 'nnr', 20.00, 'inactivo'),
(11, 1, '1899-11-30', 'yuber', 'Ave', 'Macho', '', 'loro', 3.00, 'activo'),
(12, 5, '2026-03-05', 'luna', 'Gato', 'Macho', '', 'gato', 15.00, 'inactivo'),
(13, 5, '2026-02-11', 'drhdh', 'Gato', 'Hembra', '', 'pastor', 30.00, 'activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla notificacion
--

CREATE TABLE notificacion (
  ID_notificacion INTEGER NOT NULL,
  ID_usuario INTEGER NOT NULL,
  ID_sistemaCorreo INTEGER NOT NULL,
  Mensaje text DEFAULT NULL,
  Tipo varchar(100) DEFAULT NULL,
  Canal varchar(100) DEFAULT NULL,
  Fecha_envio TIMESTAMP DEFAULT NULL,
  Leida SMALLINT DEFAULT 0,
  Fecha_lectura TIMESTAMP DEFAULT NULL
);

--
-- Volcado de datos para la tabla notificacion
--

INSERT INTO notificacion (ID_notificacion, ID_usuario, ID_sistemaCorreo, Mensaje, Tipo, Canal, Fecha_envio, Leida, Fecha_lectura) VALUES
(1, 1, 1, 'Recordatorio de vacuna para Max', 'Recordatorio', 'Correo', '2026-02-18 21:40:19', 1, '2026-06-25 06:36:05'),
(2, 2, 2, 'Confirmación de cita', 'Confirmación', 'Correo', '2026-02-18 21:40:19', 1, '2026-07-27 09:48:27'),
(3, 7, 1, 'su perro esta ue se muere\n', 'Alerta', 'SMS', '2026-05-21 07:05:46', 1, '2026-07-27 09:48:13'),
(4, 7, 1, 'la mascota', 'Alerta', 'SMS', '2026-05-21 07:11:54', 0, NULL),
(6, 1, 1, '✅ Cita agendada para Max — Consulta General el 2026-06-25 a las 08:00 AM.', 'cita', 'Sistema', '2026-06-25 06:39:07', 0, NULL),
(7, 1, 1, '✅ Cita agendada para Luna — Vacuna Antirrábica el 2026-06-25 a las 08:00 AM.', 'cita', 'Sistema', '2026-06-25 06:39:30', 0, NULL),
(8, 1, 1, '✅ Cita agendada para loki — Cirugía Esterilización el 2026-06-25 a las 08:00 AM.', 'cita', 'Sistema', '2026-06-25 06:39:55', 0, NULL),
(9, 1, 1, '✅ Cita agendada para loki — Vacuna Antirrábica el 2026-06-27 a las 04:00 PM.', 'cita', 'Sistema', '2026-06-25 07:14:41', 0, NULL),
(10, 1, 1, '✅ Cita agendada para Luna — Vacuna Antirrábica el 2026-06-27 a las 04:00 PM.', 'cita', 'Sistema', '2026-06-25 07:15:10', 0, NULL),
(11, 1, 1, '✅ Cita agendada para Max — Vacuna Antirrábica el 2026-06-27 a las 04:00 PM.', 'cita', 'Sistema', '2026-06-25 07:15:24', 0, NULL),
(12, 1, 1, '✅ Cita agendada para loki — Vacuna Antirrábica el 2026-06-27 a las 04:00 PM.', 'cita', 'Sistema', '2026-06-25 07:15:39', 1, '2026-06-27 23:31:18'),
(15, 2, 1, '💉 Vacuna \"Leucemia Felina\" registrada para Rocky aplicada el 2026-07-03. Próxima dosis: 2026-07-11.', 'vacuna', 'Sistema', '2026-06-28 10:00:02', 0, NULL),
(16, 2, 1, '✅ Cita agendada para Rocky — Vacuna Antirrábica el 2026-06-30 a las 09:00 AM.', 'cita', 'Sistema', '2026-06-28 10:13:03', 0, NULL),
(17, 1, 1, '✅ Cita agendada para Max — Consulta General el 2026-06-30 a las 08:00 AM.', 'cita', 'Sistema', '2026-06-30 10:18:15', 0, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla planalimentacion
--

CREATE TABLE planalimentacion (
  ID_planAlimentacion INTEGER NOT NULL,
  ID_mascota INTEGER NOT NULL,
  ID_servicio INTEGER NOT NULL,
  Tipo_dieta varchar(100) DEFAULT NULL,
  Frecuencia varchar(100) DEFAULT NULL,
  Alergias text DEFAULT NULL,
  Horario varchar(100) DEFAULT NULL,
  Calorias INTEGER DEFAULT NULL,
  Suplementos text DEFAULT NULL,
  Comidas text DEFAULT NULL,
  Fecha_inicio date DEFAULT NULL,
  Fecha_fin date DEFAULT NULL,
  Observaciones text DEFAULT NULL,
  Diagnostico text DEFAULT NULL,
  Revision_nutricional text DEFAULT NULL
);

--
-- Volcado de datos para la tabla planalimentacion
--

INSERT INTO planalimentacion (ID_planAlimentacion, ID_mascota, ID_servicio, Tipo_dieta, Frecuencia, Alergias, Horario, Calorias, Suplementos, Comidas, Fecha_inicio, Fecha_fin, Observaciones, Diagnostico, Revision_nutricional) VALUES
(1, 1, 1, 'Balanceada', '2 veces al día', 'Ninguna', '8am - 6pm', 1200, 'Vitaminas', 'Concentrado premium', '2026-02-20', '2026-08-20', 'Buen estado', 'Sobrepeso leve', 'Pendiente'),
(2, 3, 4, 'Especial digestiva', '3 veces al día', 'Pollo', '7am - 1pm - 7pm', 900, 'Probióticos', 'Dieta blanda', '2026-02-22', '2026-05-22', 'En observación', 'Problema digestivo', 'Mejora progresiva'),
(3, 2, 1, 'especial digestiva', '3 veces al dia ', 'Ninguna', '7am - 7 pm', 200, 'Vitaminas ', 'Desayuno 100cl - Almuerzo 100cl', '2026-06-25', '2026-08-29', 'Tiene que comer mas ', 'Esta baja de peso ', 'Activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla servicio
--

CREATE TABLE servicio (
  ID_servicio INTEGER NOT NULL,
  Nombre varchar(120) DEFAULT NULL,
  Descripcion text DEFAULT NULL,
  Categoria varchar(100) DEFAULT NULL,
  Precio decimal(10,2) DEFAULT NULL
);

--
-- Volcado de datos para la tabla servicio
--

INSERT INTO servicio (ID_servicio, Nombre, Descripcion, Categoria, Precio) VALUES
(1, 'Consulta General', 'Revisión médica básica', 'Consulta', 0.00),
(2, 'Vacuna Antirrábica', 'Aplicación vacuna contra rabia', 'Vacuna', 50000.00),
(3, 'Cirugía Esterilización', 'Procedimiento quirúrgico', 'Cirugía', 300000.00),
(4, 'Desparasitación', 'Tratamiento antiparasitario', 'Tratamiento', 40000.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla sistemacorreo
--

CREATE TABLE sistemacorreo (
  ID_sistemaCorreo INTEGER NOT NULL,
  Protocolo varchar(100) DEFAULT NULL,
  Nombre varchar(100) DEFAULT NULL
);

--
-- Volcado de datos para la tabla sistemacorreo
--

INSERT INTO sistemacorreo (ID_sistemaCorreo, Protocolo, Nombre) VALUES
(1, 'SMTP', 'Gmail SMTP'),
(2, 'API', 'SendGrid');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla usuario
--

CREATE TABLE usuario (
  ID_usuario INTEGER NOT NULL,
  Nombre varchar(100) NOT NULL,
  Correo varchar(120) NOT NULL,
  Telefono varchar(20) DEFAULT NULL,
  Contrasena varchar(255) NOT NULL,
  Rol varchar(50) NOT NULL
);

--
-- Volcado de datos para la tabla usuario
--

INSERT INTO usuario (ID_usuario, Nombre, Correo, Telefono, Contrasena, Rol) VALUES
(1, 'Juan Perez', 'juan@gmail.com', '3001111111', '$2b$10$QnUv1Dugoyoa6jQqBLh3SenFCNtMQBRWV8gqDBhZiwH9SXZw/bfwa', 'cliente'),
(2, 'Maria Lopez', 'maria@gmail.com', '3002222222', '$2b$10$C3sxx/illhIHmPW3KMAQzuLOcT9BvpfhhiR0UMS4qud.78ggTw9zm', 'cliente'),
(3, 'Carlos Ruiz', 'carlos@gmail.com', '3003333333', '123456', 'cliente'),
(4, 'Dra. Laura Gomez', 'laura@gmail.com', '3004444444', '$2b$10$VnKte3/.16E/SPaJbeT69.Tb0DZeVRw3afp1YGFiqmy0GMWoJYf5m', 'veterinario'),
(5, 'Dr. Andres Torres', 'andres@gmail.com', '3005555555', '$2b$10$DCn1rrVtUsh5zpoZz6hNV.Ray78GYN.P9qA7pmSJlMiobWC49LTsC', 'veterinario'),
(6, 'Admin Principal', 'admin@gmail.com', '3215642023', '$2b$10$pNhUlGJoLk7ope.XSHsgsOmo1Ga1ZOcV3f05pDElV3TRrgarLz5b.', 'administrador'),
(7, 'yuber franco', 'yuberfranco@gmail.com', '3132849355', '123456', 'cliente'),
(8, 'YUBER FRANCO', 'yuberfranco4@gmail.com', '3158377547', '$2b$10$oXKU8F1CfFmPEAcxnnE6yubNHqMybc7/A0PNUyZUQlV5xr1SbBc7C', 'cliente');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla veterinario
--

CREATE TABLE veterinario (
  ID_veterinario INTEGER NOT NULL,
  Cargo varchar(100) DEFAULT NULL,
  Especialidad varchar(100) DEFAULT NULL,
  ID_usuario INTEGER NOT NULL
);

--
-- Volcado de datos para la tabla veterinario
--

INSERT INTO veterinario (ID_veterinario, Cargo, Especialidad, ID_usuario) VALUES
(1, 'Veterinario General', 'Medicina Interna', 4),
(2, 'Veterinario Cirujano', 'Cirugía Animal', 5);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla veterinario_carnetvacunas
--

CREATE TABLE veterinario_carnetvacunas (
  ID_veterinarioCarnetVacunas INTEGER NOT NULL,
  ID_veterinario INTEGER NOT NULL,
  ID_carnetVacunas INTEGER NOT NULL
);

--
-- Volcado de datos para la tabla veterinario_carnetvacunas
--

INSERT INTO veterinario_carnetvacunas (ID_veterinarioCarnetVacunas, ID_veterinario, ID_carnetVacunas) VALUES
(1, 1, 1),
(2, 1, 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla veterinario_planalimentacion
--

CREATE TABLE veterinario_planalimentacion (
  ID_veterinarioPlanAlimentacion INTEGER NOT NULL,
  ID_veterinario INTEGER NOT NULL,
  ID_planAlimentacion INTEGER NOT NULL
);

--
-- Volcado de datos para la tabla veterinario_planalimentacion
--

INSERT INTO veterinario_planalimentacion (ID_veterinarioPlanAlimentacion, ID_veterinario, ID_planAlimentacion) VALUES
(1, 1, 1),
(2, 2, 2);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla administrador
--
ALTER TABLE administrador
  ADD PRIMARY KEY (ID_administrador);
CREATE INDEX idx_administrador_ID_usuario ON administrador (ID_usuario);


--
-- Indices de la tabla administradorservicio
--
ALTER TABLE administradorservicio
  ADD PRIMARY KEY (ID_adminServicio);
CREATE INDEX idx_administradorservicio_ID_servicio ON administradorservicio (ID_servicio);
CREATE INDEX idx_administradorservicio_ID_administrador ON administradorservicio (ID_administrador);


--
-- Indices de la tabla carnetvacunas
--
ALTER TABLE carnetvacunas
  ADD PRIMARY KEY (ID_carnetVacunas);
CREATE INDEX idx_carnetvacunas_ID_mascota ON carnetvacunas (ID_mascota);
CREATE INDEX idx_carnetvacunas_ID_servicio ON carnetvacunas (ID_servicio);


--
-- Indices de la tabla cita
--
ALTER TABLE cita
  ADD PRIMARY KEY (ID_cita);
CREATE INDEX idx_cita_ID_cliente ON cita (ID_cliente);
CREATE INDEX idx_cita_ID_mascota ON cita (ID_mascota);
CREATE INDEX idx_cita_ID_servicio ON cita (ID_servicio);
CREATE INDEX idx_cita_ID_veterinario ON cita (ID_veterinario);


--
-- Indices de la tabla cliente
--
ALTER TABLE cliente
  ADD PRIMARY KEY (ID_cliente);
CREATE INDEX idx_cliente_ID_usuario ON cliente (ID_usuario);


--
-- Indices de la tabla mascota
--
ALTER TABLE mascota
  ADD PRIMARY KEY (ID_mascota);
CREATE INDEX idx_mascota_ID_cliente ON mascota (ID_cliente);


--
-- Indices de la tabla notificacion
--
ALTER TABLE notificacion
  ADD PRIMARY KEY (ID_notificacion);
CREATE INDEX idx_notificacion_ID_usuario ON notificacion (ID_usuario);
CREATE INDEX idx_notificacion_ID_sistemaCorreo ON notificacion (ID_sistemaCorreo);


--
-- Indices de la tabla planalimentacion
--
ALTER TABLE planalimentacion
  ADD PRIMARY KEY (ID_planAlimentacion);
CREATE INDEX idx_planalimentacion_ID_mascota ON planalimentacion (ID_mascota);
CREATE INDEX idx_planalimentacion_ID_servicio ON planalimentacion (ID_servicio);


--
-- Indices de la tabla servicio
--
ALTER TABLE servicio
  ADD PRIMARY KEY (ID_servicio);


--
-- Indices de la tabla sistemacorreo
--
ALTER TABLE sistemacorreo
  ADD PRIMARY KEY (ID_sistemaCorreo);


--
-- Indices de la tabla usuario
--
ALTER TABLE usuario
  ADD PRIMARY KEY (ID_usuario),
  ADD CONSTRAINT usuario_correo_unique UNIQUE (Correo);


--
-- Indices de la tabla veterinario
--
ALTER TABLE veterinario
  ADD PRIMARY KEY (ID_veterinario);
CREATE INDEX idx_veterinario_ID_usuario ON veterinario (ID_usuario);


--
-- Indices de la tabla veterinario_carnetvacunas
--
ALTER TABLE veterinario_carnetvacunas
  ADD PRIMARY KEY (ID_veterinarioCarnetVacunas);
CREATE INDEX idx_veterinario_carnetvacunas_ID_veterinario ON veterinario_carnetvacunas (ID_veterinario);
CREATE INDEX idx_veterinario_carnetvacunas_ID_carnetVacunas ON veterinario_carnetvacunas (ID_carnetVacunas);


--
-- Indices de la tabla veterinario_planalimentacion
--
ALTER TABLE veterinario_planalimentacion
  ADD PRIMARY KEY (ID_veterinarioPlanAlimentacion);
CREATE INDEX idx_veterinario_planalimentacion_ID_veterinario ON veterinario_planalimentacion (ID_veterinario);
CREATE INDEX idx_veterinario_planalimentacion_ID_planAlimentacion ON veterinario_planalimentacion (ID_planAlimentacion);


--
--

--

--

--

--

--

--

--

--

--

--

--

--

--

--

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla administrador
--
ALTER TABLE administrador
  ADD CONSTRAINT administrador_ibfk_1 FOREIGN KEY (ID_usuario) REFERENCES usuario (ID_usuario);

--
-- Filtros para la tabla administradorservicio
--
ALTER TABLE administradorservicio
  ADD CONSTRAINT administradorservicio_ibfk_1 FOREIGN KEY (ID_servicio) REFERENCES servicio (ID_servicio),
  ADD CONSTRAINT administradorservicio_ibfk_2 FOREIGN KEY (ID_administrador) REFERENCES administrador (ID_administrador);

--
-- Filtros para la tabla carnetvacunas
--
ALTER TABLE carnetvacunas
  ADD CONSTRAINT carnetvacunas_ibfk_1 FOREIGN KEY (ID_mascota) REFERENCES mascota (ID_mascota),
  ADD CONSTRAINT carnetvacunas_ibfk_2 FOREIGN KEY (ID_servicio) REFERENCES servicio (ID_servicio);

--
-- Filtros para la tabla cita
--
ALTER TABLE cita
  ADD CONSTRAINT cita_ibfk_1 FOREIGN KEY (ID_cliente) REFERENCES cliente (ID_cliente),
  ADD CONSTRAINT cita_ibfk_2 FOREIGN KEY (ID_mascota) REFERENCES mascota (ID_mascota),
  ADD CONSTRAINT cita_ibfk_3 FOREIGN KEY (ID_servicio) REFERENCES servicio (ID_servicio),
  ADD CONSTRAINT cita_ibfk_4 FOREIGN KEY (ID_veterinario) REFERENCES veterinario (ID_veterinario);

--
-- Filtros para la tabla cliente
--
ALTER TABLE cliente
  ADD CONSTRAINT cliente_ibfk_1 FOREIGN KEY (ID_usuario) REFERENCES usuario (ID_usuario);

--
-- Filtros para la tabla mascota
--
ALTER TABLE mascota
  ADD CONSTRAINT mascota_ibfk_1 FOREIGN KEY (ID_cliente) REFERENCES cliente (ID_cliente);

--
-- Filtros para la tabla notificacion
--
ALTER TABLE notificacion
  ADD CONSTRAINT notificacion_ibfk_1 FOREIGN KEY (ID_usuario) REFERENCES usuario (ID_usuario),
  ADD CONSTRAINT notificacion_ibfk_2 FOREIGN KEY (ID_sistemaCorreo) REFERENCES sistemacorreo (ID_sistemaCorreo);

--
-- Filtros para la tabla planalimentacion
--
ALTER TABLE planalimentacion
  ADD CONSTRAINT planalimentacion_ibfk_1 FOREIGN KEY (ID_mascota) REFERENCES mascota (ID_mascota),
  ADD CONSTRAINT planalimentacion_ibfk_2 FOREIGN KEY (ID_servicio) REFERENCES servicio (ID_servicio);

--
-- Filtros para la tabla veterinario
--
ALTER TABLE veterinario
  ADD CONSTRAINT veterinario_ibfk_1 FOREIGN KEY (ID_usuario) REFERENCES usuario (ID_usuario);

--
-- Filtros para la tabla veterinario_carnetvacunas
--
ALTER TABLE veterinario_carnetvacunas
  ADD CONSTRAINT veterinario_carnetvacunas_ibfk_1 FOREIGN KEY (ID_veterinario) REFERENCES veterinario (ID_veterinario),
  ADD CONSTRAINT veterinario_carnetvacunas_ibfk_2 FOREIGN KEY (ID_carnetVacunas) REFERENCES carnetvacunas (ID_carnetVacunas);

--
-- Filtros para la tabla veterinario_planalimentacion
--
ALTER TABLE veterinario_planalimentacion
  ADD CONSTRAINT veterinario_planalimentacion_ibfk_1 FOREIGN KEY (ID_veterinario) REFERENCES veterinario (ID_veterinario),
  ADD CONSTRAINT veterinario_planalimentacion_ibfk_2 FOREIGN KEY (ID_planAlimentacion) REFERENCES planalimentacion (ID_planAlimentacion);

-- ============================================================
-- Convertir las columnas ID_* en autoincrementales (IDENTITY)
-- y ajustar el contador al valor máximo ya insertado.
-- Usa information_schema para encontrar el nombre REAL de cada
-- columna (evita errores de mayúsculas/minúsculas de Postgres).
-- ============================================================
DO $$
DECLARE
  par text[];
  tabla text;
  columna_pedida text;
  columna_real text;
BEGIN
  FOREACH par SLICE 1 IN ARRAY ARRAY[
    ARRAY['administrador', 'ID_administrador'],
    ARRAY['administradorservicio', 'ID_adminServicio'],
    ARRAY['carnetvacunas', 'ID_carnetVacunas'],
    ARRAY['cita', 'ID_cita'],
    ARRAY['cliente', 'ID_cliente'],
    ARRAY['mascota', 'ID_mascota'],
    ARRAY['notificacion', 'ID_notificacion'],
    ARRAY['planalimentacion', 'ID_planAlimentacion'],
    ARRAY['servicio', 'ID_servicio'],
    ARRAY['sistemacorreo', 'ID_sistemaCorreo'],
    ARRAY['usuario', 'ID_usuario'],
    ARRAY['veterinario', 'ID_veterinario'],
    ARRAY['veterinario_carnetvacunas', 'ID_veterinarioCarnetVacunas'],
    ARRAY['veterinario_planalimentacion', 'ID_veterinarioPlanAlimentacion']
  ]
  LOOP
    tabla := par[1];
    columna_pedida := par[2];

    SELECT column_name INTO columna_real
    FROM information_schema.columns
    WHERE table_name = lower(tabla)
      AND lower(column_name) = lower(columna_pedida)
    LIMIT 1;

    IF columna_real IS NOT NULL THEN
      EXECUTE format(
        'ALTER TABLE %I ALTER COLUMN %I ADD GENERATED BY DEFAULT AS IDENTITY',
        tabla, columna_real
      );
      EXECUTE format(
        'SELECT setval(pg_get_serial_sequence(%L, %L), COALESCE((SELECT MAX(%I) FROM %I), 1), true)',
        tabla, columna_real, columna_real, tabla
      );
    ELSE
      RAISE NOTICE 'Columna % no encontrada en tabla %, se omite.', columna_pedida, tabla;
    END IF;
  END LOOP;
END $$;