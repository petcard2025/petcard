-- ================================================================
--  CLÍNICA VETERINARIA — CONSULTAS SQL
--  Base de datos: petcard
-- ================================================================


-- ================================================================
-- 1. CONSULTAS BÁSICAS
-- ================================================================

-- Todos los administradores registrados
SELECT
    a.ID_administrador,
    u.Nombre             AS nombre_administrador,
    a.Cargo,
    a.Area,
    a.Permisos
FROM administrador a
INNER JOIN usuario u ON a.ID_usuario = u.ID_usuario;

-- Todos los servicios disponibles
SELECT
    ID_servicio,
    Nombre,
    Descripcion,
    Categoria,
    Precio
FROM servicio
ORDER BY Categoria, Precio DESC;

-- Todos los clientes registrados
SELECT
    c.ID_cliente,
    u.Nombre             AS nombre_cliente,
    u.Correo,
    u.Telefono,
    c.Direccion
FROM cliente c
INNER JOIN usuario u ON c.ID_usuario = u.ID_usuario
ORDER BY u.Nombre;

-- Todas las mascotas registradas
SELECT
    m.ID_mascota,
    m.Nombre             AS nombre_mascota,
    m.Especie,
    m.Sexo,
    m.Raza,
    m.Fecha_nacimiento,
    m.Peso,
    u.Nombre             AS nombre_dueno
FROM mascota m
INNER JOIN cliente c ON m.ID_cliente = c.ID_cliente
INNER JOIN usuario u ON c.ID_usuario = u.ID_usuario
ORDER BY m.Especie, m.Nombre;

-- Todas las citas ordenadas por fecha
SELECT
    ci.ID_cita,
    uc.Nombre            AS nombre_cliente,
    m.Nombre             AS nombre_mascota,
    s.Nombre             AS nombre_servicio,
    uv.Nombre            AS nombre_veterinario,
    ci.Fecha,
    ci.Hora,
    ci.Motivo,
    ci.Observaciones
FROM cita ci
INNER JOIN cliente     c   ON ci.ID_cliente     = c.ID_cliente
INNER JOIN usuario     uc  ON c.ID_usuario      = uc.ID_usuario
INNER JOIN mascota     m   ON ci.ID_mascota     = m.ID_mascota
INNER JOIN veterinario v   ON ci.ID_veterinario = v.ID_veterinario
INNER JOIN usuario     uv  ON v.ID_usuario      = uv.ID_usuario
INNER JOIN servicio    s   ON ci.ID_servicio    = s.ID_servicio
ORDER BY ci.Fecha DESC, ci.Hora ASC;

-- Todos los planes de alimentacion
SELECT
    pa.ID_planAlimentacion,
    m.Nombre             AS nombre_mascota,
    s.Nombre             AS nombre_servicio,
    pa.Tipo_dieta,
    pa.Frecuencia,
    pa.Alergias,
    pa.Calorias,
    pa.Fecha_inicio,
    pa.Fecha_fin
FROM planalimentacion pa
INNER JOIN mascota  m ON pa.ID_mascota  = m.ID_mascota
INNER JOIN servicio s ON pa.ID_servicio = s.ID_servicio
ORDER BY pa.Fecha_inicio DESC;

-- Todos los usuarios del sistema
SELECT
    ID_usuario,
    Nombre,
    Correo,
    Telefono,
    Rol
FROM usuario
ORDER BY Rol, Nombre;


-- ================================================================
-- 2. CONSULTAS CON CONDICIONES (WHERE)
-- ================================================================

-- Citas del mes de febrero 2026
SELECT
    ci.ID_cita,
    ci.Fecha,
    ci.Hora,
    uc.Nombre            AS nombre_cliente,
    m.Nombre             AS nombre_mascota,
    uv.Nombre            AS nombre_veterinario,
    s.Nombre             AS nombre_servicio,
    ci.Motivo,
    ci.Observaciones
FROM cita ci
INNER JOIN cliente     c   ON ci.ID_cliente     = c.ID_cliente
INNER JOIN usuario     uc  ON c.ID_usuario      = uc.ID_usuario
INNER JOIN mascota     m   ON ci.ID_mascota     = m.ID_mascota
INNER JOIN veterinario v   ON ci.ID_veterinario = v.ID_veterinario
INNER JOIN usuario     uv  ON v.ID_usuario      = uv.ID_usuario
INNER JOIN servicio    s   ON ci.ID_servicio    = s.ID_servicio
WHERE ci.Fecha BETWEEN '2026-02-01' AND '2026-02-28'
ORDER BY ci.Fecha ASC, ci.Hora ASC;

-- Servicios de categoria Cirugia
SELECT
    ID_servicio,
    Nombre,
    Descripcion,
    Categoria,
    Precio
FROM servicio
WHERE Categoria = 'Cirugia'
ORDER BY Precio DESC;

-- Mascotas de sexo Macho
SELECT
    m.ID_mascota,
    m.Nombre             AS nombre_mascota,
    m.Especie,
    m.Raza,
    m.Sexo,
    m.Fecha_nacimiento,
    u.Nombre             AS nombre_dueno
FROM mascota m
INNER JOIN cliente c ON m.ID_cliente = c.ID_cliente
INNER JOIN usuario u ON c.ID_usuario = u.ID_usuario
WHERE m.Sexo = 'Macho'
ORDER BY m.Especie, m.Nombre;

-- Carnets de vacunas en estado En proceso
SELECT
    cv.ID_carnetVacunas,
    m.Nombre             AS nombre_mascota,
    m.Especie,
    s.Nombre             AS nombre_servicio,
    cv.Nombre_vacuna,
    cv.Laboratorio,
    cv.Lote,
    cv.Fecha_aplicacion,
    cv.Proxima_dosis,
    cv.Estado,
    cv.Observaciones
FROM carnetvacunas cv
INNER JOIN mascota  m ON cv.ID_mascota  = m.ID_mascota
INNER JOIN servicio s ON cv.ID_servicio = s.ID_servicio
WHERE cv.Estado = 'En proceso';

-- Planes de alimentacion con suplementos registrados
SELECT
    pa.ID_planAlimentacion,
    m.Nombre             AS nombre_mascota,
    m.Especie,
    pa.Tipo_dieta,
    pa.Suplementos,
    pa.Calorias
FROM planalimentacion pa
INNER JOIN mascota m ON pa.ID_mascota = m.ID_mascota
WHERE pa.Suplementos IS NOT NULL
  AND pa.Suplementos <> ''
ORDER BY pa.Calorias DESC;

-- Notificaciones enviadas por canal Correo
SELECT
    n.ID_notificacion,
    u.Nombre             AS nombre_usuario,
    n.Mensaje,
    n.Tipo,
    n.Canal,
    n.Fecha_envio
FROM notificacion n
INNER JOIN usuario u ON n.ID_usuario = u.ID_usuario
WHERE n.Canal = 'Correo'
ORDER BY n.Fecha_envio DESC;

-- Usuarios con rol veterinario
SELECT
    ID_usuario,
    Nombre,
    Correo,
    Telefono,
    Rol
FROM usuario
WHERE Rol = 'veterinario'
ORDER BY Nombre;

-- Servicios con precio mayor a 50000
SELECT
    ID_servicio,
    Nombre,
    Descripcion,
    Categoria,
    Precio
FROM servicio
WHERE Precio > 50000
ORDER BY Precio DESC;


-- ================================================================
-- 3. AGRUPACIONES (GROUP BY)
-- ================================================================

-- Total de citas por veterinario
SELECT
    uv.Nombre            AS nombre_veterinario,
    v.Especialidad,
    COUNT(ci.ID_cita)    AS total_citas
FROM cita ci
INNER JOIN veterinario v  ON ci.ID_veterinario = v.ID_veterinario
INNER JOIN usuario     uv ON v.ID_usuario      = uv.ID_usuario
GROUP BY v.ID_veterinario, uv.Nombre, v.Especialidad
ORDER BY total_citas DESC;

-- Total de mascotas por especie y sexo
SELECT
    Especie,
    Sexo,
    COUNT(*)             AS cantidad
FROM mascota
GROUP BY Especie, Sexo
ORDER BY Especie, Sexo;

-- Servicios agrupados por categoria con estadisticas de precio
SELECT
    Categoria,
    COUNT(*)             AS total_servicios,
    MIN(Precio)          AS precio_minimo,
    MAX(Precio)          AS precio_maximo,
    AVG(Precio)          AS precio_promedio
FROM servicio
GROUP BY Categoria
ORDER BY precio_promedio DESC;

-- Citas agrupadas por mes y año
SELECT
    YEAR(Fecha)          AS anio,
    MONTH(Fecha)         AS mes,
    COUNT(*)             AS total_citas
FROM cita
GROUP BY YEAR(Fecha), MONTH(Fecha)
ORDER BY anio DESC, mes DESC;

-- Vacunas agrupadas por laboratorio y estado
SELECT
    Laboratorio,
    Estado,
    COUNT(*)             AS total_vacunas
FROM carnetvacunas
GROUP BY Laboratorio, Estado
ORDER BY Laboratorio, total_vacunas DESC;

-- Planes de alimentacion por tipo de dieta
SELECT
    Tipo_dieta,
    COUNT(*)             AS total_planes,
    AVG(Calorias)        AS calorias_promedio
FROM planalimentacion
GROUP BY Tipo_dieta
ORDER BY total_planes DESC;

-- Notificaciones por tipo y canal
SELECT
    Tipo,
    Canal,
    COUNT(*)             AS total_enviadas
FROM notificacion
GROUP BY Tipo, Canal
ORDER BY total_enviadas DESC;


-- ================================================================
-- 4. INNER JOIN (CRUCE DE TABLAS)
-- ================================================================

-- Cliente con su informacion de usuario
SELECT
    u.ID_usuario,
    u.Nombre             AS nombre_cliente,
    u.Correo,
    u.Telefono,
    u.Rol,
    c.ID_cliente,
    c.Direccion
FROM cliente c
INNER JOIN usuario u ON c.ID_usuario = u.ID_usuario;

-- Veterinario con su informacion de usuario
SELECT
    u.Nombre             AS nombre_veterinario,
    u.Correo,
    u.Telefono,
    v.ID_veterinario,
    v.Cargo,
    v.Especialidad
FROM veterinario v
INNER JOIN usuario u ON v.ID_usuario = u.ID_usuario;

-- Citas con nombre del servicio asociado
SELECT
    ci.ID_cita,
    ci.Fecha,
    ci.Hora,
    uc.Nombre            AS nombre_cliente,
    m.Nombre             AS nombre_mascota,
    uv.Nombre            AS nombre_veterinario,
    s.Nombre             AS nombre_servicio,
    s.Categoria,
    s.Precio,
    ci.Motivo,
    ci.Observaciones
FROM cita ci
INNER JOIN cliente     c   ON ci.ID_cliente     = c.ID_cliente
INNER JOIN usuario     uc  ON c.ID_usuario      = uc.ID_usuario
INNER JOIN mascota     m   ON ci.ID_mascota     = m.ID_mascota
INNER JOIN veterinario v   ON ci.ID_veterinario = v.ID_veterinario
INNER JOIN usuario     uv  ON v.ID_usuario      = uv.ID_usuario
INNER JOIN servicio    s   ON ci.ID_servicio    = s.ID_servicio
ORDER BY ci.Fecha DESC;

-- Mascotas con sus carnets de vacunas
-- NOTA: el JOIN correcto es mascota -> carnetvacunas por ID_mascota
SELECT
    m.Nombre             AS nombre_mascota,
    m.Especie,
    m.Raza,
    u.Nombre             AS nombre_dueno,
    cv.Nombre_vacuna,
    cv.Laboratorio,
    cv.Lote,
    cv.Fecha_aplicacion,
    cv.Proxima_dosis,
    cv.Estado
FROM mascota m
INNER JOIN cliente        c  ON m.ID_cliente  = c.ID_cliente
INNER JOIN usuario        u  ON c.ID_usuario  = u.ID_usuario
INNER JOIN carnetvacunas  cv ON m.ID_mascota  = cv.ID_mascota
ORDER BY m.Nombre, cv.Fecha_aplicacion DESC;

-- Planes de alimentacion con su mascota y dueño
SELECT
    m.Nombre             AS nombre_mascota,
    m.Especie,
    u.Nombre             AS nombre_dueno,
    pa.Tipo_dieta,
    pa.Frecuencia,
    pa.Alergias,
    pa.Calorias,
    pa.Suplementos,
    pa.Fecha_inicio,
    pa.Fecha_fin,
    pa.Observaciones
FROM planalimentacion pa
INNER JOIN mascota m ON pa.ID_mascota  = m.ID_mascota
INNER JOIN cliente c ON m.ID_cliente   = c.ID_cliente
INNER JOIN usuario u ON c.ID_usuario   = u.ID_usuario
ORDER BY m.Nombre;

-- Administradores con los servicios que gestionan
SELECT
    u.Nombre             AS nombre_administrador,
    a.Cargo,
    a.Area,
    s.Nombre             AS nombre_servicio,
    s.Categoria,
    s.Precio
FROM administrador a
INNER JOIN usuario               u   ON a.ID_usuario        = u.ID_usuario
INNER JOIN administradorservicio ads ON a.ID_administrador  = ads.ID_administrador
INNER JOIN servicio              s   ON ads.ID_servicio     = s.ID_servicio;

-- Mascota con su cliente dueño
SELECT
    m.ID_mascota,
    m.Nombre             AS nombre_mascota,
    m.Especie,
    m.Raza,
    m.Sexo,
    u.Nombre             AS nombre_dueno,
    u.Telefono,
    c.Direccion
FROM mascota m
INNER JOIN cliente c ON m.ID_cliente = c.ID_cliente
INNER JOIN usuario u ON c.ID_usuario = u.ID_usuario;


-- ================================================================
-- 5. CONSULTAS AVANZADAS
-- ================================================================

-- Top 3 servicios mas solicitados en citas
SELECT
    s.Nombre             AS nombre_servicio,
    s.Categoria,
    COUNT(ci.ID_cita)    AS veces_solicitado,
    SUM(s.Precio)        AS ingresos_generados
FROM cita ci
INNER JOIN servicio s ON ci.ID_servicio = s.ID_servicio
GROUP BY s.ID_servicio, s.Nombre, s.Categoria
ORDER BY veces_solicitado DESC
LIMIT 3;

-- Veterinarios con mas de 1 cita asignada
SELECT
    uv.Nombre            AS nombre_veterinario,
    v.Especialidad,
    COUNT(ci.ID_cita)    AS total_citas
FROM veterinario v
INNER JOIN usuario uv ON v.ID_usuario     = uv.ID_usuario
INNER JOIN cita    ci ON v.ID_veterinario = ci.ID_veterinario
GROUP BY v.ID_veterinario, uv.Nombre, v.Especialidad
HAVING COUNT(ci.ID_cita) > 1
ORDER BY total_citas DESC;

-- Mascotas sin plan de alimentacion registrado
SELECT
    m.ID_mascota,
    m.Nombre             AS nombre_mascota,
    m.Especie,
    m.Sexo,
    m.Fecha_nacimiento,
    u.Nombre             AS nombre_dueno,
    u.Telefono
FROM mascota m
INNER JOIN cliente c ON m.ID_cliente  = c.ID_cliente
INNER JOIN usuario u ON c.ID_usuario  = u.ID_usuario
LEFT  JOIN planalimentacion pa ON m.ID_mascota = pa.ID_mascota
WHERE pa.ID_mascota IS NULL;

-- Vacunas proximas a vencer en los siguientes 30 dias
SELECT
    u.Nombre             AS nombre_dueno,
    u.Telefono,
    m.Nombre             AS nombre_mascota,
    m.Especie,
    cv.Nombre_vacuna,
    cv.Laboratorio,
    cv.Proxima_dosis,
    DATEDIFF(cv.Proxima_dosis, CURDATE()) AS dias_restantes
FROM carnetvacunas cv
INNER JOIN mascota m ON cv.ID_mascota = m.ID_mascota
INNER JOIN cliente c ON m.ID_cliente  = c.ID_cliente
INNER JOIN usuario u ON c.ID_usuario  = u.ID_usuario
WHERE cv.Proxima_dosis BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
ORDER BY cv.Proxima_dosis ASC;

-- Clientes que nunca han agendado una cita
SELECT
    u.Nombre             AS nombre_cliente,
    u.Correo,
    u.Telefono,
    c.Direccion
FROM cliente c
INNER JOIN usuario u ON c.ID_usuario = u.ID_usuario
LEFT  JOIN cita    ci ON c.ID_cliente = ci.ID_cliente
WHERE ci.ID_cliente IS NULL;

-- Ingresos totales por categoria de servicio segun citas realizadas
SELECT
    s.Categoria,
    COUNT(ci.ID_cita)    AS total_citas,
    SUM(s.Precio)        AS ingresos_totales,
    AVG(s.Precio)        AS ticket_promedio
FROM cita ci
INNER JOIN servicio s ON ci.ID_servicio = s.ID_servicio
GROUP BY s.Categoria
ORDER BY ingresos_totales DESC;

-- Mascotas sin vacunas registradas
SELECT
    m.ID_mascota,
    m.Nombre             AS nombre_mascota,
    m.Especie,
    m.Raza,
    u.Nombre             AS nombre_dueno,
    u.Telefono
FROM mascota m
INNER JOIN cliente       c  ON m.ID_cliente  = c.ID_cliente
INNER JOIN usuario       u  ON c.ID_usuario  = u.ID_usuario
LEFT  JOIN carnetvacunas cv ON m.ID_mascota  = cv.ID_mascota
WHERE cv.ID_mascota IS NULL;


-- ================================================================
-- 6. CONSULTAS COMPLETAS (MULTI JOIN)
-- ================================================================

-- Historial completo de citas: cliente + mascota + veterinario + servicio
SELECT
    ci.ID_cita,
    ci.Fecha,
    ci.Hora,
    uc.Nombre            AS nombre_cliente,
    uc.Telefono          AS telefono_cliente,
    m.Nombre             AS nombre_mascota,
    m.Especie,
    uv.Nombre            AS nombre_veterinario,
    v.Especialidad,
    s.Nombre             AS nombre_servicio,
    s.Categoria,
    s.Precio,
    ci.Motivo,
    ci.Observaciones
FROM cita ci
INNER JOIN cliente     c   ON ci.ID_cliente     = c.ID_cliente
INNER JOIN usuario     uc  ON c.ID_usuario      = uc.ID_usuario
INNER JOIN mascota     m   ON ci.ID_mascota     = m.ID_mascota
INNER JOIN veterinario v   ON ci.ID_veterinario = v.ID_veterinario
INNER JOIN usuario     uv  ON v.ID_usuario      = uv.ID_usuario
INNER JOIN servicio    s   ON ci.ID_servicio    = s.ID_servicio
ORDER BY ci.Fecha DESC, ci.Hora ASC;

-- Ficha medica completa: dueño + mascota + vacunas + plan alimentacion
SELECT
    uc.Nombre            AS nombre_dueno,
    uc.Correo,
    uc.Telefono,
    m.Nombre             AS nombre_mascota,
    m.Especie,
    m.Raza,
    m.Sexo,
    m.Fecha_nacimiento,
    cv.Nombre_vacuna,
    cv.Laboratorio,
    cv.Fecha_aplicacion,
    cv.Proxima_dosis,
    cv.Estado            AS estado_vacuna,
    pa.Tipo_dieta,
    pa.Calorias,
    pa.Frecuencia
FROM mascota m
INNER JOIN cliente          c   ON m.ID_cliente  = c.ID_cliente
INNER JOIN usuario          uc  ON c.ID_usuario  = uc.ID_usuario
LEFT  JOIN carnetvacunas    cv  ON m.ID_mascota  = cv.ID_mascota
LEFT  JOIN planalimentacion pa  ON m.ID_mascota  = pa.ID_mascota
ORDER BY uc.Nombre, m.Nombre;

-- Reporte de notificaciones: usuario notificado + configuracion correo
-- NOTA: FK correcta es ID_sistemaCorreo -> sistemacorreo
SELECT
    n.ID_notificacion,
    u.Nombre             AS usuario_destino,
    u.Correo,
    sc.Nombre            AS servidor_correo,
    sc.Protocolo,
    n.Mensaje,
    n.Tipo,
    n.Canal,
    n.Fecha_envio
FROM notificacion n
INNER JOIN usuario       u  ON n.ID_usuario       = u.ID_usuario
INNER JOIN sistemacorreo sc ON n.ID_sistemaCorreo = sc.ID_sistemaCorreo
ORDER BY n.Fecha_envio DESC;

-- Veterinario + carnets de vacunas que supervisa + mascota
SELECT
    uv.Nombre            AS nombre_veterinario,
    v.Especialidad,
    m.Nombre             AS nombre_mascota,
    m.Especie,
    u.Nombre             AS nombre_dueno,
    cv.Nombre_vacuna,
    cv.Laboratorio,
    cv.Lote,
    cv.Fecha_aplicacion,
    cv.Proxima_dosis,
    cv.Estado
FROM veterinario_carnetvacunas vcv
INNER JOIN veterinario   v   ON vcv.ID_veterinario   = v.ID_veterinario
INNER JOIN usuario       uv  ON v.ID_usuario         = uv.ID_usuario
INNER JOIN carnetvacunas cv  ON vcv.ID_carnetVacunas = cv.ID_carnetVacunas
INNER JOIN mascota       m   ON cv.ID_mascota        = m.ID_mascota
INNER JOIN cliente       c   ON m.ID_cliente         = c.ID_cliente
INNER JOIN usuario       u   ON c.ID_usuario         = u.ID_usuario
ORDER BY uv.Nombre, m.Nombre;

-- Veterinario + planes de alimentacion que supervisa + mascota
SELECT
    uv.Nombre            AS nombre_veterinario,
    v.Especialidad,
    m.Nombre             AS nombre_mascota,
    m.Especie,
    u.Nombre             AS nombre_dueno,
    pa.Tipo_dieta,
    pa.Calorias,
    pa.Frecuencia,
    pa.Fecha_inicio,
    pa.Fecha_fin
FROM veterinario_planalimentacion vpa
INNER JOIN veterinario      v   ON vpa.ID_veterinario      = v.ID_veterinario
INNER JOIN usuario          uv  ON v.ID_usuario            = uv.ID_usuario
INNER JOIN planalimentacion pa  ON vpa.ID_planAlimentacion = pa.ID_planAlimentacion
INNER JOIN mascota          m   ON pa.ID_mascota           = m.ID_mascota
INNER JOIN cliente          c   ON m.ID_cliente            = c.ID_cliente
INNER JOIN usuario          u   ON c.ID_usuario            = u.ID_usuario
ORDER BY uv.Nombre, m.Nombre;

-- Reporte global: administrador + servicios gestionados + citas generadas
SELECT
    ua.Nombre            AS nombre_administrador,
    a.Cargo,
    a.Area,
    s.Nombre             AS nombre_servicio,
    s.Categoria,
    s.Precio,
    COUNT(ci.ID_cita)    AS citas_generadas,
    COALESCE(SUM(s.Precio), 0) AS ingresos_por_servicio
FROM administrador a
INNER JOIN usuario               ua  ON a.ID_usuario        = ua.ID_usuario
INNER JOIN administradorservicio ads ON a.ID_administrador  = ads.ID_administrador
INNER JOIN servicio              s   ON ads.ID_servicio     = s.ID_servicio
LEFT  JOIN cita                  ci  ON s.ID_servicio       = ci.ID_servicio
GROUP BY ua.Nombre, a.Cargo, a.Area, s.ID_servicio, s.Nombre, s.Categoria, s.Precio
ORDER BY citas_generadas DESC;

-- Vista 360 del sistema: cliente + mascota + cita + veterinario + vacuna + plan
SELECT
    uc.Nombre            AS cliente,
    uc.Telefono,
    m.Nombre             AS mascota,
    m.Especie,
    m.Raza,
    ci.Fecha             AS fecha_cita,
    ci.Hora,
    ci.Motivo,
    uv.Nombre            AS veterinario,
    v.Especialidad,
    s.Nombre             AS servicio,
    s.Precio,
    cv.Nombre_vacuna,
    cv.Estado            AS estado_vacuna,
    pa.Tipo_dieta,
    pa.Observaciones     AS observacion_plan
FROM cita ci
INNER JOIN cliente          c   ON ci.ID_cliente     = c.ID_cliente
INNER JOIN usuario          uc  ON c.ID_usuario      = uc.ID_usuario
INNER JOIN mascota          m   ON ci.ID_mascota     = m.ID_mascota
INNER JOIN veterinario      v   ON ci.ID_veterinario = v.ID_veterinario
INNER JOIN usuario          uv  ON v.ID_usuario      = uv.ID_usuario
INNER JOIN servicio         s   ON ci.ID_servicio    = s.ID_servicio
LEFT  JOIN carnetvacunas    cv  ON m.ID_mascota      = cv.ID_mascota
LEFT  JOIN planalimentacion pa  ON m.ID_mascota      = pa.ID_mascota
ORDER BY ci.Fecha DESC, uc.Nombre ASC;


-- ================================================================
-- 7. LOGIN Y REGISTRO
-- ================================================================

-- ► LOGIN: Verificar credenciales de cualquier usuario
SELECT
    u.ID_usuario,
    u.Nombre,
    u.Correo,
    u.Telefono,
    u.Rol
FROM usuario u
WHERE u.Correo     = 'correo@ejemplo.com'
  AND u.Contrasena = 'contraseña123'
LIMIT 1;

-- ► LOGIN COMPLETO: Verificar credenciales y obtener perfil segun rol
SELECT
    u.ID_usuario,
    u.Nombre,
    u.Correo,
    u.Telefono,
    u.Rol,
    c.ID_cliente,
    c.Direccion              AS direccion_cliente,
    v.ID_veterinario,
    v.Cargo                  AS cargo_veterinario,
    v.Especialidad           AS especialidad_veterinario,
    a.ID_administrador,
    a.Cargo                  AS cargo_administrador,
    a.Area                   AS area_administrador,
    a.Permisos               AS permisos_administrador
FROM usuario u
LEFT JOIN cliente       c ON u.ID_usuario = c.ID_usuario
LEFT JOIN veterinario   v ON u.ID_usuario = v.ID_usuario
LEFT JOIN administrador a ON u.ID_usuario = a.ID_usuario
WHERE u.Correo     = 'correo@ejemplo.com'
  AND u.Contrasena = 'contraseña123'
LIMIT 1;

-- ► VERIFICAR SESION: Ver todos los usuarios con su rol y perfil
SELECT
    u.ID_usuario,
    u.Nombre,
    u.Correo,
    u.Telefono,
    u.Rol,
    CASE
        WHEN c.ID_cliente       IS NOT NULL THEN c.Direccion
        ELSE NULL
    END AS direccion_cliente,
    CASE
        WHEN v.ID_veterinario   IS NOT NULL THEN v.Especialidad
        ELSE NULL
    END AS especialidad_veterinario,
    CASE
        WHEN a.ID_administrador IS NOT NULL THEN a.Area
        ELSE NULL
    END AS area_administrador
FROM usuario u
LEFT JOIN cliente       c ON u.ID_usuario = c.ID_usuario
LEFT JOIN veterinario   v ON u.ID_usuario = v.ID_usuario
LEFT JOIN administrador a ON u.ID_usuario = a.ID_usuario
ORDER BY u.Rol, u.Nombre;

-- ► VERIFICAR CORREO: Comprobar si un correo ya esta en uso
SELECT COUNT(*) AS correo_existente
FROM usuario
WHERE Correo = 'nuevo@ejemplo.com';

-- ► REGISTRO CLIENTE PASO 1: Crear el usuario base con rol cliente
INSERT INTO usuario (Nombre, Correo, Telefono, Contrasena, Rol)
VALUES ('Nombre Apellido', 'nuevo@ejemplo.com', '3001234567', 'contraseña123', 'cliente');

-- ► REGISTRO CLIENTE PASO 2: Crear el perfil cliente vinculado al usuario
INSERT INTO cliente (Direccion, ID_usuario)
VALUES ('Calle 123 # 45-67 Ciudad', LAST_INSERT_ID());

-- ► REGISTRO VETERINARIO PASO 1: Crear el usuario base con rol veterinario
INSERT INTO usuario (Nombre, Correo, Telefono, Contrasena, Rol)
VALUES ('Dr. Nombre Apellido', 'vet@ejemplo.com', '3109876543', 'contraseña123', 'veterinario');

-- ► REGISTRO VETERINARIO PASO 2: Crear el perfil veterinario vinculado al usuario
INSERT INTO veterinario (Cargo, Especialidad, ID_usuario)
VALUES ('Veterinario General', 'Medicina Interna', LAST_INSERT_ID());

-- ► REGISTRO ADMINISTRADOR PASO 1: Crear el usuario base con rol administrador
INSERT INTO usuario (Nombre, Correo, Telefono, Contrasena, Rol)
VALUES ('Admin Nombre', 'admin@ejemplo.com', '3201234567', 'contraseña123', 'administrador');

-- ► REGISTRO ADMINISTRADOR PASO 2: Crear el perfil administrador vinculado al usuario
INSERT INTO administrador (Cargo, Area, Permisos, ID_usuario)
VALUES ('Administrador General', 'Administración', 'Control total del sistema', LAST_INSERT_ID());
