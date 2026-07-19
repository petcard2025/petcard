-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 19-07-2026 a las 06:38:08
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
(4, 'Dra. Laura Gomez', 'laura@gmail.com', '3004444444', '$2b$10$VnKte3/.16E/SPaJbeT69.Tb0DZeVRw3afp1YGFiqmy0GMWoJYf5m', 'veterinario'),
(5, 'Dr. Andres Torres', 'andres@gmail.com', '3005555555', '123456', 'veterinario'),
(6, 'Admin Principal', 'admin@gmail.com', '3215642023', '$2b$10$pNhUlGJoLk7ope.XSHsgsOmo1Ga1ZOcV3f05pDElV3TRrgarLz5b.', 'administrador'),
(7, 'yuber franco', 'yuberfranco@gmail.com', '3132849355', '123456', 'cliente'),
(8, 'YUBER FRANCO', 'yuberfranco4@gmail.com', '3158377547', '$2b$10$oXKU8F1CfFmPEAcxnnE6yubNHqMybc7/A0PNUyZUQlV5xr1SbBc7C', 'cliente');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`ID_usuario`),
  ADD UNIQUE KEY `Correo` (`Correo`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `ID_usuario` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del usuario dentro del sistema.', AUTO_INCREMENT=9;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
