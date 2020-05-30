-- phpMyAdmin SQL Dump
-- version 4.8.4
-- https://www.phpmyadmin.net/
--
-- Host: by1lwyweakf4kfgc2fxn-mysql.services.clever-cloud.com:3306
-- Generation Time: May 30, 2020 at 04:15 PM
-- Server version: 8.0.13-3
-- PHP Version: 7.2.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `by1lwyweakf4kfgc2fxn`
--

-- --------------------------------------------------------

--
-- Table structure for table `bookmark`
--

DROP TABLE IF EXISTS `bookmark`;
CREATE TABLE `bookmark` (
  `username` varchar(15) NOT NULL,
  `id_book` int(11) NOT NULL,
  `page_number` varchar(20) NOT NULL,
  `note` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `d_bookshelf`
--

DROP TABLE IF EXISTS `d_bookshelf`;
CREATE TABLE `d_bookshelf` (
  `username` varchar(15) NOT NULL,
  `id_book` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `d_playlist`
--

DROP TABLE IF EXISTS `d_playlist`;
CREATE TABLE `d_playlist` (
  `id_playlist` varchar(10) NOT NULL,
  `id_book` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `h_bookshelf`
--

DROP TABLE IF EXISTS `h_bookshelf`;
CREATE TABLE `h_bookshelf` (
  `username` varchar(15) NOT NULL,
  `type` int(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `h_playlist`
--

DROP TABLE IF EXISTS `h_playlist`;
CREATE TABLE `h_playlist` (
  `id_playlist` varchar(10) NOT NULL,
  `username` varchar(15) NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` int(1) NOT NULL,
  `created_date` datetime NOT NULL,
  `modified_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `review`
--

DROP TABLE IF EXISTS `review`;
CREATE TABLE `review` (
  `id_book` int(11) NOT NULL,
  `username` varchar(15) NOT NULL,
  `rating` int(11) NOT NULL,
  `comment` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `username` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `password` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `name` varchar(100) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `type` int(1) NOT NULL,
  `profile_picture` varchar(100) NOT NULL,
  `transaction_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `status` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bookmark`
--
ALTER TABLE `bookmark`
  ADD PRIMARY KEY (`username`,`id_book`);

--
-- Indexes for table `d_bookshelf`
--
ALTER TABLE `d_bookshelf`
  ADD PRIMARY KEY (`username`,`id_book`);

--
-- Indexes for table `d_playlist`
--
ALTER TABLE `d_playlist`
  ADD PRIMARY KEY (`id_playlist`,`id_book`);

--
-- Indexes for table `h_bookshelf`
--
ALTER TABLE `h_bookshelf`
  ADD PRIMARY KEY (`username`);

--
-- Indexes for table `h_playlist`
--
ALTER TABLE `h_playlist`
  ADD PRIMARY KEY (`id_playlist`),
  ADD KEY `fk_h_playlist_username` (`username`);

--
-- Indexes for table `review`
--
ALTER TABLE `review`
  ADD PRIMARY KEY (`id_book`,`username`),
  ADD KEY `fk_review_username` (`username`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`username`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookmark`
--
ALTER TABLE `bookmark`
  ADD CONSTRAINT `fk_bookmark_username` FOREIGN KEY (`username`) REFERENCES `user` (`username`);

--
-- Constraints for table `d_bookshelf`
--
ALTER TABLE `d_bookshelf`
  ADD CONSTRAINT `fk_d_bookshelf_username` FOREIGN KEY (`username`) REFERENCES `user` (`username`);

--
-- Constraints for table `d_playlist`
--
ALTER TABLE `d_playlist`
  ADD CONSTRAINT `fk_d_playlist_id_playlist` FOREIGN KEY (`id_playlist`) REFERENCES `h_playlist` (`id_playlist`);

--
-- Constraints for table `h_bookshelf`
--
ALTER TABLE `h_bookshelf`
  ADD CONSTRAINT `fk_h_bookshelf_username` FOREIGN KEY (`username`) REFERENCES `user` (`username`);

--
-- Constraints for table `h_playlist`
--
ALTER TABLE `h_playlist`
  ADD CONSTRAINT `fk_h_playlist_username` FOREIGN KEY (`username`) REFERENCES `user` (`username`);

--
-- Constraints for table `review`
--
ALTER TABLE `review`
  ADD CONSTRAINT `fk_review_username` FOREIGN KEY (`username`) REFERENCES `user` (`username`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
