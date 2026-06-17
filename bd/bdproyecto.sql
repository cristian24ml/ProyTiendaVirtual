-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 17-06-2026 a las 19:14:38
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `bdproyecto`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria`
--

CREATE TABLE `categoria` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categoria`
--

INSERT INTO `categoria` (`id`, `nombre`) VALUES
(3, 'Papeleria'),
(11, 'Reconocimiento en vidrio'),
(12, 'Reconocimiento en Madera'),
(13, 'Muñecos danza Boliviana');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_pedido`
--

CREATE TABLE `detalle_pedido` (
  `id` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precioUnitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `pedidoId` int(11) DEFAULT NULL,
  `productoId` int(11) DEFAULT NULL,
  `personalizacion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `detalle_pedido`
--

INSERT INTO `detalle_pedido` (`id`, `cantidad`, `precioUnitario`, `subtotal`, `pedidoId`, `productoId`, `personalizacion`) VALUES
(9, 3, 130.00, 390.00, 11, 41, ''),
(10, 1, 150.00, 150.00, 12, 10, ''),
(11, 2, 130.00, 260.00, 12, 42, ''),
(12, 1, 150.00, 150.00, 13, 12, '');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `log_acceso`
--

CREATE TABLE `log_acceso` (
  `id` int(11) NOT NULL,
  `usuarioId` int(11) DEFAULT NULL,
  `username` varchar(255) NOT NULL,
  `ip` varchar(255) NOT NULL,
  `evento` varchar(255) NOT NULL,
  `browser` varchar(255) NOT NULL,
  `fecha_hora` datetime(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `log_acceso`
--

INSERT INTO `log_acceso` (`id`, `usuarioId`, `username`, `ip`, `evento`, `browser`, `fecha_hora`) VALUES
(1, NULL, 'pedro', '::1', 'intento_fallido', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', '2026-06-13 09:48:41.875901'),
(2, NULL, 'pedro', '::1', 'intento_fallido', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', '2026-06-13 09:48:55.994790'),
(3, NULL, 'pedro', '::1', 'intento_fallido', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', '2026-06-13 09:51:11.531925'),
(4, NULL, 'pedro', '::1', 'intento_fallido', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', '2026-06-13 09:52:20.731853'),
(5, NULL, 'pedro', '::1', 'intento_fallido', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', '2026-06-13 09:52:29.656869'),
(6, NULL, 'pedro', '::1', 'intento_fallido', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', '2026-06-13 09:52:42.489759'),
(7, NULL, 'pedro', '::1', 'intento_fallido', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', '2026-06-13 09:52:46.731877'),
(8, NULL, 'pedro', '::1', 'intento_fallido', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', '2026-06-13 09:52:50.227703'),
(9, 7, 'cristian123', '::1', 'ingreso', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', '2026-06-13 09:59:28.324748'),
(10, 8, 'juan', '::1', 'ingreso', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', '2026-06-14 22:51:13.275457'),
(11, 8, 'juan', '::1', 'salida', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', '2026-06-14 23:09:00.032144'),
(12, 7, 'cristian123', '::1', 'ingreso', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', '2026-06-14 23:09:33.038998'),
(13, 8, 'juan', '::1', 'ingreso', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', '2026-06-15 21:13:51.802869'),
(14, 8, 'juan', '::1', 'salida', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', '2026-06-15 21:55:10.775661'),
(15, 7, 'cristian123', '::1', 'ingreso', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', '2026-06-15 21:55:40.256824'),
(16, 8, 'juan', '::1', 'ingreso', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', '2026-06-16 09:46:26.419585'),
(17, 8, 'juan', '::1', 'salida', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', '2026-06-16 10:07:00.111004'),
(18, 7, 'cristian123', '::1', 'ingreso', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', '2026-06-16 10:07:24.621483'),
(19, 7, 'cristian123', '::1', 'ingreso', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', '2026-06-17 10:03:31.502624'),
(20, 7, 'cristian123', '::1', 'salida', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', '2026-06-17 10:38:53.671738'),
(21, 8, 'juan', '::1', 'ingreso', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', '2026-06-17 10:39:14.604958'),
(22, 8, 'juan', '::1', 'salida', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', '2026-06-17 11:13:54.753417'),
(23, 7, 'cristian123', '::1', 'ingreso', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', '2026-06-17 11:14:13.868384');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedido`
--

CREATE TABLE `pedido` (
  `id` int(11) NOT NULL,
  `fecha` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `total` decimal(10,2) NOT NULL,
  `nombreCompleto` varchar(255) DEFAULT NULL,
  `telefono` varchar(255) DEFAULT NULL,
  `correo` varchar(255) DEFAULT NULL,
  `usuarioId` int(11) DEFAULT NULL,
  `metodoPago` varchar(255) DEFAULT 'Efectivo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pedido`
--

INSERT INTO `pedido` (`id`, `fecha`, `total`, `nombreCompleto`, `telefono`, `correo`, `usuarioId`, `metodoPago`) VALUES
(4, '2026-06-10 21:56:42.736377', 45.00, 'Consumidor', NULL, NULL, NULL, 'Efectivo'),
(5, '2026-06-10 22:03:12.725107', 100.00, 'Consumidor', NULL, NULL, NULL, 'Efectivo'),
(6, '2026-06-10 22:19:38.150328', 180.00, 'Consumidor Final', NULL, NULL, NULL, 'Efectivo'),
(7, '2026-06-10 22:23:55.012387', 90.00, 'Consumidor Final', NULL, NULL, NULL, 'Efectivo'),
(8, '2026-06-10 23:18:26.351681', 280.00, 'Comprador Efectivo', '71234567', 'efectivo@gmail.com', NULL, 'Efectivo'),
(9, '2026-06-10 23:22:09.939196', 45.00, 'Comprador QR', '77788899', 'qr_test@gmail.com', NULL, 'QR'),
(10, '2026-06-14 23:13:16.982570', 90.00, 'Rodrigo', '63233782', 'marcacristianrodrigo2@gamil.com', NULL, 'QR'),
(11, '2026-06-16 09:25:03.318497', 390.00, 'Lucas', '71234568', 'lucas2@gmail.com', NULL, 'Efectivo'),
(12, '2026-06-16 09:26:50.216236', 410.00, 'Lucas', '71234567', 'lucas2026@gmail.com', NULL, 'QR'),
(13, '2026-06-16 09:40:10.861326', 150.00, 'Alejo', '61234567', 'alejandro@gmail.com', NULL, 'QR');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto`
--

CREATE TABLE `producto` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `imagen` varchar(255) NOT NULL,
  `categoriaId` int(11) DEFAULT NULL,
  `stock` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `producto`
--

INSERT INTO `producto` (`id`, `nombre`, `precio`, `imagen`, `categoriaId`, `stock`) VALUES
(10, 'Modelo 1', 150.00, '/products/1781572540404-798984543.jpeg', 11, 9),
(11, 'Modelo 2', 150.00, '/products/1781572604086-9545241.jpeg', 11, 10),
(12, 'Modelo 3', 150.00, '/products/1781572627369-345788072.jpeg', 11, 9),
(13, 'Modelo 4', 150.00, '/products/1781572652104-507280690.jpeg', 11, 10),
(14, 'Modelo 5', 150.00, '/products/1781572699153-678269798.jpeg', 11, 10),
(15, 'Modelo 6', 150.00, '/products/1781572725124-374764258.jpeg', 11, 10),
(16, 'Modelo 7', 150.00, '/products/1781572754055-68345653.jpeg', 11, 10),
(17, 'Modelo 1', 130.00, '/products/1781573135255-89830082.jpeg', 12, 10),
(18, 'Modelo 2', 130.00, '/products/1781573164525-529847920.jpeg', 12, 10),
(19, 'Modelo 3', 130.00, '/products/1781573185813-950751708.jpeg', 12, 10),
(20, 'Modelo 4', 130.00, '/products/1781573248847-914003207.jpeg', 12, 10),
(21, 'Modelo 5', 130.00, '/products/1781573270919-161574507.jpeg', 12, 10),
(22, 'Modelo 6', 130.00, '/products/1781573317455-748886644.jpeg', 12, 10),
(23, 'Modelo 7', 130.00, '/products/1781573338769-6449889.jpeg', 12, 10),
(24, 'Modelo 8', 130.00, '/products/1781573382808-434902289.jpeg', 12, 10),
(25, 'Modelo 9', 130.00, '/products/1781573407028-517698397.jpeg', 12, 10),
(26, 'Modelo 10', 130.00, '/products/1781573428078-269413434.jpeg', 12, 10),
(27, 'Modelo 11', 130.00, '/products/1781573447386-27192208.jpeg', 12, 10),
(28, 'Modelo 12', 130.00, '/products/1781573478420-924404464.jpeg', 12, 10),
(29, 'Modelo 13', 130.00, '/products/1781573502120-849633003.jpeg', 12, 10),
(30, 'Modelo 14', 130.00, '/products/1781573525170-490583096.jpeg', 12, 10),
(31, 'Modelo 15', 130.00, '/products/1781573565429-428230499.jpeg', 12, 10),
(32, 'Modelo 16', 130.00, '/products/1781573584748-868061996.jpeg', 12, 10),
(33, 'Modelo 17', 130.00, '/products/1781573608076-755849415.jpeg', 12, 10),
(34, 'Modelo 18', 130.00, '/products/1781573627298-451356581.jpeg', 12, 10),
(35, 'Modelo 19', 130.00, '/products/1781573684024-17109002.jpeg', 12, 10),
(36, 'Modelo 20', 130.00, '/products/1781573707370-125618022.jpeg', 12, 10),
(37, 'Modelo 21', 130.00, '/products/1781573731432-485397499.jpeg', 12, 10),
(38, 'Modelo 22', 130.00, '/products/1781573753360-123850854.jpeg', 12, 10),
(39, 'Modelo 23', 130.00, '/products/1781573791317-35071065.jpeg', 12, 10),
(40, 'Modelo 24', 130.00, '/products/1781573810975-37518754.jpeg', 12, 10),
(41, 'Modelo 25', 130.00, '/products/1781573828350-208322430.jpeg', 12, 7),
(42, 'Modelo 26', 130.00, '/products/1781573847795-805266255.jpeg', 12, 8),
(43, 'Modelo 27', 130.00, '/products/1781573876338-21860837.jpeg', 12, 10),
(44, 'Modelo 1', 130.00, '/products/1781575818416-26256375.jpeg', 13, 8),
(45, 'Modelo 2', 130.00, '/products/1781575837612-342876914.jpeg', 13, 8),
(46, 'Modelo 3', 130.00, '/products/1781575866779-986898742.jpeg', 13, 8),
(47, 'Modelo 4', 130.00, '/products/1781575896759-567789343.jpeg', 13, 8),
(48, 'Modelo 5', 130.00, '/products/1781575936132-602214571.jpeg', 13, 8),
(49, 'Modelo 6', 130.00, '/products/1781575961466-265744962.jpeg', 13, 8),
(50, 'Modelo 7', 130.00, '/products/1781575979277-705095579.jpeg', 13, 8),
(51, 'Modelo 8', 130.00, '/products/1781575996417-38532731.jpeg', 13, 8),
(52, 'Modelo 9', 130.00, '/products/1781576020979-800786786.jpeg', 13, 8),
(53, 'Modelo 10', 130.00, '/products/1781576042024-52731012.jpeg', 13, 8),
(54, 'Modelo 11', 130.00, '/products/1781576061991-183064453.jpeg', 13, 8),
(55, 'Modelo 12', 130.00, '/products/1781576084382-672555871.jpeg', 13, 8);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `imagen` varchar(255) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `categoriaId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol`
--

CREATE TABLE `rol` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `rol`
--

INSERT INTO `rol` (`id`, `nombre`) VALUES
(1, 'Administrador'),
(2, 'Vendedor'),
(3, 'Cliente');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id` int(11) NOT NULL,
  `nombreCompleto` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rolId` int(11) DEFAULT NULL,
  `nivelPassword` varchar(255) DEFAULT NULL,
  `username` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id`, `nombreCompleto`, `password`, `rolId`, `nivelPassword`, `username`) VALUES
(7, 'Cristian', 'f874b9a5289a7140e8267cc6b7dd8a1c:9bc05c269e1429ddf45d094f4bae287800024ddf1b3f117784411a8c6afdec746cf02fdfbfc9cc4bf50c2cfa9f2c56b191e4a6bcd09dad115c130ae38d0d9581', 1, 'intermedia', 'cristian123'),
(8, 'juan carlos', '0e43875c3102cf22f2a802979a07de27:a8335c6059e6c16f0492737733ed2a49c449a6e81cf0b52c5304b7065d368f578de24ecbb927463b9b3d212a509bd227a4247eaa3adc5eb413588bebd27e0d8f', 2, 'intermedia', 'juan'),
(11, 'David ', 'e5c77d530f9f5b5ac859545e059d5619:bab82f4dc17d84fab80f0e85292d82a9ac2d793ed5bbe61078a739ef80d16a14062fc9795fb902c34ef204ed0f8d6bac996df2c0c9da514ecbe654cc09a82ccc', 2, 'intermedia', 'david123456');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categoria`
--
ALTER TABLE `categoria`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_4d39e79d693b68f9f35cf4238e1` (`pedidoId`),
  ADD KEY `FK_aa6bb17cb0e47d62ace803293eb` (`productoId`);

--
-- Indices de la tabla `log_acceso`
--
ALTER TABLE `log_acceso`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_48f37360d1e6031c816792177a5` (`usuarioId`);

--
-- Indices de la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_440272d326db467ee25802678e8` (`usuarioId`);

--
-- Indices de la tabla `producto`
--
ALTER TABLE `producto`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_6465b0476dcfd393c4808d53b95` (`categoriaId`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_aee00189e42dd8880cdfe1bb1e7` (`categoriaId`);

--
-- Indices de la tabla `rol`
--
ALTER TABLE `rol`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `IDX_6ccff37176a6978449a99c82e1` (`username`),
  ADD KEY `FK_611daf5befc024d9e0bd7bdf4da` (`rolId`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categoria`
--
ALTER TABLE `categoria`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `log_acceso`
--
ALTER TABLE `log_acceso`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT de la tabla `pedido`
--
ALTER TABLE `pedido`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `producto`
--
ALTER TABLE `producto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `rol`
--
ALTER TABLE `rol`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  ADD CONSTRAINT `FK_4d39e79d693b68f9f35cf4238e1` FOREIGN KEY (`pedidoId`) REFERENCES `pedido` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_aa6bb17cb0e47d62ace803293eb` FOREIGN KEY (`productoId`) REFERENCES `producto` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `log_acceso`
--
ALTER TABLE `log_acceso`
  ADD CONSTRAINT `FK_48f37360d1e6031c816792177a5` FOREIGN KEY (`usuarioId`) REFERENCES `usuario` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

--
-- Filtros para la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD CONSTRAINT `FK_440272d326db467ee25802678e8` FOREIGN KEY (`usuarioId`) REFERENCES `usuario` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `producto`
--
ALTER TABLE `producto`
  ADD CONSTRAINT `FK_6465b0476dcfd393c4808d53b95` FOREIGN KEY (`categoriaId`) REFERENCES `categoria` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `FK_aee00189e42dd8880cdfe1bb1e7` FOREIGN KEY (`categoriaId`) REFERENCES `categoria` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `FK_611daf5befc024d9e0bd7bdf4da` FOREIGN KEY (`rolId`) REFERENCES `rol` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
