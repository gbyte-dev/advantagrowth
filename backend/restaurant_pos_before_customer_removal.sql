-- MySQL dump 10.13  Distrib 8.0.41, for Linux (x86_64)
--
-- Host: localhost    Database: restaurant_pos
-- ------------------------------------------------------
-- Server version	8.0.41-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_messages`
--

DROP TABLE IF EXISTS `contact_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_messages` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `restaurant_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `contact_messages_restaurant_id_foreign` (`restaurant_id`),
  CONSTRAINT `contact_messages_restaurant_id_foreign` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_messages`
--

LOCK TABLES `contact_messages` WRITE;
/*!40000 ALTER TABLE `contact_messages` DISABLE KEYS */;
INSERT INTO `contact_messages` VALUES (3,6,'Rajnish Sharma','rajnishh.off@gmail.com','9955795489','General Inquiry','whahahah',0,'2026-08-11 05:38:48','2026-08-11 05:38:48'),(4,5,'singapore server','singaporeserver5632s@gmail.com','7896541230','General Inquiry','Helllooo',0,'2026-08-11 07:08:17','2026-08-11 07:08:17'),(5,5,'singapore server','singaporeserver5632s@gmail.com','9874563210','General Inquiry','Wowwwwwwwwwww',0,'2026-08-11 07:26:35','2026-08-11 07:26:35'),(6,5,'singapore server','singaporeserver5632s@gmail.com','7896541230','General Inquiry','Nice',0,'2026-08-11 07:35:48','2026-08-11 07:35:48'),(7,5,'Rajnish Sharma','rajnishh.off@gmail.com','9955795489','General Inquiry','Collabbb',0,'2026-08-14 08:24:56','2026-08-14 08:24:56');
/*!40000 ALTER TABLE `contact_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `restaurant_id` bigint unsigned DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `customers_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (4,NULL,'Costomer','customer@gmail.com','9874563210','$2y$12$xUjLz8Rc7S.H8qLPM.IR/e/uKXK7zNsLemYxQT.J0XmyXbTStshue',1,NULL,'2026-08-09 23:50:42','2026-08-09 23:50:42'),(5,NULL,'Raj','Raj@gmail.com','9876543210','$2y$12$RGODpon7crZvu5QTlTw3peyvonyAyJvkmt1/l9FvYW.pw.tlR8Lim',1,NULL,'2026-08-13 23:44:51','2026-08-13 23:44:51');
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `email_otps`
--

DROP TABLE IF EXISTS `email_otps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_otps` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `otp` varchar(6) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `email_otps_user_id_foreign` (`user_id`),
  CONSTRAINT `email_otps_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_otps`
--

LOCK TABLES `email_otps` WRITE;
/*!40000 ALTER TABLE `email_otps` DISABLE KEYS */;
/*!40000 ALTER TABLE `email_otps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`),
  KEY `failed_jobs_connection_queue_failed_at_index` (`connection`,`queue`,`failed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` smallint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menu_categories`
--

DROP TABLE IF EXISTS `menu_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu_categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `restaurant_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `menu_categories_restaurant_id_is_active_index` (`restaurant_id`,`is_active`),
  CONSTRAINT `menu_categories_restaurant_id_foreign` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu_categories`
--

LOCK TABLES `menu_categories` WRITE;
/*!40000 ALTER TABLE `menu_categories` DISABLE KEYS */;
INSERT INTO `menu_categories` VALUES (2,5,'Burger','Wowwww',1,0,'2026-08-09 23:53:16','2026-08-09 23:53:16'),(3,5,'Pizza','ummmmmm',1,0,'2026-08-12 06:37:37','2026-08-12 06:37:37'),(4,5,'French Fries',NULL,1,0,'2026-08-12 06:44:04','2026-08-12 06:44:04'),(5,5,'Hot Dog',NULL,1,0,'2026-08-12 06:45:01','2026-08-12 06:45:01'),(6,5,'Tacos',NULL,1,0,'2026-08-12 06:45:44','2026-08-12 06:45:44'),(7,5,'Fried Chicken',NULL,1,0,'2026-08-12 06:46:48','2026-08-12 06:46:48');
/*!40000 ALTER TABLE `menu_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menu_items`
--

DROP TABLE IF EXISTS `menu_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `restaurant_id` bigint unsigned NOT NULL,
  `menu_category_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(10,2) NOT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `food_type` enum('veg','non_veg','egg') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'veg',
  `is_available` tinyint(1) NOT NULL DEFAULT '1',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `menu_items_menu_category_id_foreign` (`menu_category_id`),
  KEY `menu_items_restaurant_id_is_active_is_available_index` (`restaurant_id`,`is_active`,`is_available`),
  CONSTRAINT `menu_items_menu_category_id_foreign` FOREIGN KEY (`menu_category_id`) REFERENCES `menu_categories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `menu_items_restaurant_id_foreign` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu_items`
--

LOCK TABLES `menu_items` WRITE;
/*!40000 ALTER TABLE `menu_items` DISABLE KEYS */;
INSERT INTO `menu_items` VALUES (2,5,2,'Cheeseburger','A classic burger topped with a slice of melted cheese.',199.00,NULL,'veg',1,1,0,'2026-08-09 23:53:47','2026-08-12 06:43:54'),(3,5,3,'Margherita','A simple, classic Italian pizza with tomato sauce, fresh mozzarella, and basil.',199.00,NULL,'veg',1,1,0,'2026-08-12 06:38:10','2026-08-12 06:43:24'),(4,5,4,'Waffle Fries','Cut in a crisscross pattern, making them great for holding sauces.',149.00,NULL,'veg',1,1,0,'2026-08-12 06:44:42','2026-08-12 06:44:42'),(5,5,5,'Corn Dog','A sausage coated in a thick layer of sweet cornmeal batter and deep-fried on a stick.',149.00,NULL,'non_veg',1,1,0,'2026-08-12 06:45:29','2026-08-12 06:45:29'),(6,5,6,'Carne Asada','Grilled and sliced beef (usually flank or skirt steak).',249.00,NULL,'non_veg',1,1,0,'2026-08-12 06:46:32','2026-08-12 06:46:32'),(7,5,7,'Chicken Nuggets','Small, bite-sized pieces of ground or whole chicken breast, heavily breaded.',349.00,NULL,'non_veg',1,1,0,'2026-08-12 06:47:22','2026-08-12 06:47:22'),(8,5,3,'Onion Pizza',NULL,159.00,NULL,'veg',1,1,0,'2026-08-14 08:26:22','2026-08-14 08:26:22');
/*!40000 ALTER TABLE `menu_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(4,'2026_08_06_073938_create_personal_access_tokens_table',1),(5,'2026_08_06_074959_create_restaurants_table',1),(6,'2026_08_06_075000_create_email_otps_table',1),(7,'2026_08_06_121150_add_restaurant_foreign_key_to_users_table',1),(8,'2026_08_07_071431_create_customers_table',2),(9,'2026_08_07_123746_add_staff_fields_to_users_table',3),(10,'2026_08_08_052120_create_menu_categories_table',4),(11,'2026_08_08_052457_create_menu_items_table',4),(12,'2026_08_08_105611_create_reviews_table',5),(13,'2026_08_11_082740_create_restaurant_contact_settings_table',6),(14,'2026_08_11_082954_create_contact_messages_table',6),(15,'2026_08_12_054303_add_profile_image_to_users_table',7),(16,'2026_08_13_061703_create_reservations_table',8),(17,'2026_08_13_082735_create_restaurant_stories_table',9),(18,'2026_08_13_084340_add_about_fields_to_restaurants_table',10),(19,'2026_08_13_112313_create_restaurant_marquee_items_table',11),(20,'2026_08_13_125046_add_hero_fields_to_restaurants_table',12),(21,'2026_08_14_071947_create_orders_table',13),(22,'2026_08_14_071948_create_order_items_table',13),(23,'2026_08_14_081724_add_delivery_address_to_orders_table',14);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `menu_item_id` bigint unsigned NOT NULL,
  `item_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `quantity` int unsigned NOT NULL DEFAULT '1',
  `total_price` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_items_order_id_foreign` (`order_id`),
  KEY `order_items_menu_item_id_foreign` (`menu_item_id`),
  CONSTRAINT `order_items_menu_item_id_foreign` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `order_items_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,2,'Cheeseburger',199.00,1,199.00,'2026-08-14 02:55:25','2026-08-14 02:55:25'),(2,2,2,'Cheeseburger',199.00,1,199.00,'2026-08-14 02:59:13','2026-08-14 02:59:13'),(3,3,2,'Cheeseburger',199.00,1,199.00,'2026-08-14 05:40:10','2026-08-14 05:40:10'),(4,3,4,'Waffle Fries',149.00,1,149.00,'2026-08-14 05:40:10','2026-08-14 05:40:10'),(5,4,2,'Cheeseburger',199.00,1,199.00,'2026-08-14 05:44:57','2026-08-14 05:44:57'),(6,4,4,'Waffle Fries',149.00,1,149.00,'2026-08-14 05:44:57','2026-08-14 05:44:57'),(7,5,2,'Cheeseburger',199.00,1,199.00,'2026-08-14 05:50:38','2026-08-14 05:50:38'),(8,5,4,'Waffle Fries',149.00,1,149.00,'2026-08-14 05:50:38','2026-08-14 05:50:38'),(9,6,2,'Cheeseburger',199.00,1,199.00,'2026-08-14 06:10:33','2026-08-14 06:10:33'),(10,6,3,'Margherita',199.00,1,199.00,'2026-08-14 06:10:33','2026-08-14 06:10:33'),(11,7,2,'Cheeseburger',199.00,1,199.00,'2026-08-14 06:31:15','2026-08-14 06:31:15'),(12,8,2,'Cheeseburger',199.00,1,199.00,'2026-08-14 06:32:45','2026-08-14 06:32:45'),(13,9,2,'Cheeseburger',199.00,1,199.00,'2026-08-14 06:54:41','2026-08-14 06:54:41'),(14,10,2,'Cheeseburger',199.00,1,199.00,'2026-08-14 08:19:00','2026-08-14 08:19:00'),(15,10,3,'Margherita',199.00,1,199.00,'2026-08-14 08:19:00','2026-08-14 08:19:00'),(16,11,5,'Corn Dog',149.00,1,149.00,'2026-08-14 08:23:18','2026-08-14 08:23:18'),(17,11,6,'Carne Asada',249.00,1,249.00,'2026-08-14 08:23:18','2026-08-14 08:23:18'),(18,11,7,'Chicken Nuggets',349.00,1,349.00,'2026-08-14 08:23:18','2026-08-14 08:23:18'),(19,12,2,'Cheeseburger',199.00,1,199.00,'2026-08-18 01:23:09','2026-08-18 01:23:09'),(20,12,3,'Margherita',199.00,1,199.00,'2026-08-18 01:23:09','2026-08-18 01:23:09');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `restaurant_id` bigint unsigned NOT NULL,
  `customer_id` bigint unsigned DEFAULT NULL,
  `customer_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_phone` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `delivery_address` text COLLATE utf8mb4_unicode_ci,
  `subtotal` decimal(10,2) NOT NULL DEFAULT '0.00',
  `delivery_charge` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `payment_status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `payment_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_method` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `special_instructions` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `orders_restaurant_id_foreign` (`restaurant_id`),
  KEY `orders_customer_id_foreign` (`customer_id`),
  CONSTRAINT `orders_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `orders_restaurant_id_foreign` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,5,NULL,'Rajnish Sharma','9955795489','rajnishh.off@gmail.com','AZamgarh',199.00,0.00,199.00,'cancelled','pending',NULL,NULL,'ummmmmmmm','2026-08-14 02:55:25','2026-08-14 07:02:39'),(2,5,NULL,'Rajnish Sharma','9874563210','rajnishh.off@gmail.com','www',199.00,0.00,199.00,'cancelled','pending',NULL,NULL,'www','2026-08-14 02:59:13','2026-08-14 07:02:47'),(3,5,NULL,'Rajnish Sharma','9955795489','rajnishh.off@gmail.com',NULL,348.00,0.00,348.00,'cancelled','pending',NULL,NULL,NULL,'2026-08-14 05:40:10','2026-08-14 07:02:51'),(4,5,NULL,'Rajnish Sharma','9874563210','rajnishh.off@gmail.com',NULL,348.00,0.00,348.00,'cancelled','pending',NULL,NULL,NULL,'2026-08-14 05:44:57','2026-08-14 07:02:56'),(5,5,NULL,'Rajnish Sharma','9632587410','rajnishh.off@gmail.com',NULL,348.00,0.00,348.00,'completed','paid','order_TPdC2U6CYP2i8z',NULL,'ffffffffffff','2026-08-14 05:50:38','2026-08-14 07:03:02'),(6,5,NULL,'Rajnish Sharma','9874563210','rajnishh.off@gmail.com',NULL,398.00,0.00,398.00,'completed','paid','order_TPdXCfFMwGVCGF',NULL,'dddddddddddd','2026-08-14 06:10:33','2026-08-14 07:03:03'),(7,5,NULL,'Rajnish Sharma','9632587410','rajnishh.off@gmail.com',NULL,199.00,0.00,199.00,'ready','paid','order_TPdsxuCY43WE0l',NULL,'ff','2026-08-14 06:31:15','2026-08-14 07:03:06'),(8,5,NULL,'Rajnish Sharma','9874563210','rajnishh.off@gmail.com',NULL,199.00,0.00,199.00,'cancelled','pending','order_TPduZOEE5pWwNg',NULL,'dd','2026-08-14 06:32:45','2026-08-14 07:03:12'),(9,5,NULL,'Rajnish Sharma','9874563210','rajnishh.off@gmail.com',NULL,199.00,0.00,199.00,'preparing','paid','order_TPeHhFcdJDRu5p',NULL,'qqqqqqq','2026-08-14 06:54:41','2026-08-14 07:03:16'),(10,5,NULL,'Rajnish Sharma','9632587410','rajnishh.off@gmail.com',NULL,398.00,0.00,398.00,'confirmed','paid','order_TPfipM9ewtjvqC',NULL,'eee','2026-08-14 08:19:00','2026-08-14 08:20:08'),(11,5,NULL,'Rajnish Sharma','9874563210','rajnishh.off@gmail.com',NULL,747.00,0.00,747.00,'completed','paid','order_TPfnIYRwfnD5P5',NULL,'qwwq','2026-08-14 08:23:18','2026-08-14 08:26:54'),(12,5,NULL,'singapore server','9632587410','singaporeserver5632s@gmail.com',NULL,398.00,0.00,398.00,'preparing','paid','order_TR8lxXBG8hqnkq',NULL,'ff','2026-08-18 01:23:09','2026-08-18 01:30:42');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=166 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (1,'App\\Models\\User',1,'auth_token','455b8da32c1925491aaf582809c4cc17a7f005d48b0ec547dc0ce88bbbd7b953','[\"*\"]',NULL,NULL,'2026-08-07 01:41:45','2026-08-07 01:41:45'),(2,'App\\Models\\Customer',1,'customer_token','4b9a821168d2bde0c0e7947895634f73ec085a126d6c1cc3d41236882cc5d298','[\"*\"]',NULL,NULL,'2026-08-07 01:56:19','2026-08-07 01:56:19'),(3,'App\\Models\\Customer',1,'customer_token','57773d609a5eb5dde12090034b2cabec34342b6d19ee1947415d6190d5c13c12','[\"*\"]',NULL,NULL,'2026-08-07 02:13:08','2026-08-07 02:13:08'),(4,'App\\Models\\User',1,'auth_token','7ff78810793b464c25785ec6f177c64b0bcf0266fbc1c0352a49d64eb39135a5','[\"*\"]',NULL,NULL,'2026-08-07 02:13:22','2026-08-07 02:13:22'),(5,'App\\Models\\Customer',1,'customer_token','403ed16c2c4e31a1e54df55137f91175020f0980ba9b01d22ba4ec505c5b0986','[\"*\"]',NULL,NULL,'2026-08-07 02:50:59','2026-08-07 02:50:59'),(6,'App\\Models\\User',1,'auth_token','cd1b6090a1bc8928538be6b98a3811feafc96c204768fd22dccb7020035da2b0','[\"*\"]',NULL,NULL,'2026-08-07 02:51:24','2026-08-07 02:51:24'),(7,'App\\Models\\Customer',2,'customer_token','d72e73e4d84b45bd46e2a9363f9df55aac0a236bdb382144ae7e4ee7321b94bc','[\"*\"]',NULL,NULL,'2026-08-07 02:53:25','2026-08-07 02:53:25'),(8,'App\\Models\\Customer',2,'customer_token','6b1828db6fd772dbae1de19def3f5db9f0f9fbafca6e6c5f1ab43240bf1bbbc8','[\"*\"]',NULL,NULL,'2026-08-07 03:02:38','2026-08-07 03:02:38'),(9,'App\\Models\\User',3,'auth_token','7ca546298a6adfa3d9a7a00134bf1804d6684e849a0c895da4b91af916530c2a','[\"*\"]',NULL,NULL,'2026-08-07 03:03:16','2026-08-07 03:03:16'),(10,'App\\Models\\Customer',2,'customer_token','689bd385f2dee649d398823b3e306aab9b548ad68b73e973210b60616a3a81e6','[\"*\"]',NULL,NULL,'2026-08-07 03:03:30','2026-08-07 03:03:30'),(11,'App\\Models\\Customer',3,'customer_token','990c49b6e139b94e563b652e3e81559c9c7ab21df22b7c44c3ece9e7f20d6d01','[\"*\"]',NULL,NULL,'2026-08-07 03:04:41','2026-08-07 03:04:41'),(12,'App\\Models\\User',4,'auth_token','066931ce0179246f3813545c242f796ca82e6bb39f67274bcc6fabd5904d693d','[\"*\"]',NULL,NULL,'2026-08-07 03:06:12','2026-08-07 03:06:12'),(14,'App\\Models\\Customer',3,'customer_token','a9ec644efbb45228b9f139a3ed03b4980e0dd6e25d858d9bd0a075ea07640bb6','[\"*\"]',NULL,NULL,'2026-08-07 05:57:04','2026-08-07 05:57:04'),(15,'App\\Models\\User',4,'auth_token','eeb0e5544638eb2c6217755a854406a2924189dd52882848d8051b9dd770620f','[\"*\"]',NULL,NULL,'2026-08-07 05:58:28','2026-08-07 05:58:28'),(17,'App\\Models\\User',4,'auth_token','6fc3cc5fc1a429a6d7ffd32c6b1d885accb9f3a2bc809f3d9c2118cf5a6d0b64','[\"*\"]',NULL,NULL,'2026-08-07 06:18:29','2026-08-07 06:18:29'),(19,'App\\Models\\User',4,'auth_token','7ecc9d94d047a2a78bdb4bc1d736617ff4e23078837f16c3231c6df7cc1cc68f','[\"*\"]','2026-08-07 08:39:25',NULL,'2026-08-07 07:25:54','2026-08-07 08:39:25'),(22,'App\\Models\\User',4,'auth_token','432ac9ff2c4d1a0ef1e56636093f789f62f89c0de035e2ad42330944f0999723','[\"*\"]','2026-08-08 01:03:08',NULL,'2026-08-08 00:19:49','2026-08-08 01:03:08'),(23,'App\\Models\\User',6,'staff','bcfcc6e78c135161622d9a8c7e66161da5a423b45f4a570b5679670f03ab1b56','[\"*\"]','2026-08-08 01:15:45',NULL,'2026-08-08 01:15:45','2026-08-08 01:15:45'),(24,'App\\Models\\Customer',3,'customer_token','69045437b952eafb82ab17a16767e64962e73eff29e4b4bdc15f41b12ec262e8','[\"*\"]','2026-08-08 01:43:51',NULL,'2026-08-08 01:18:31','2026-08-08 01:43:51'),(25,'App\\Models\\User',4,'auth_token','344c294b33147ef049b446b9b49f67c85f5dc9ba55d477b29f0fc54b6e7ccff0','[\"*\"]','2026-08-08 04:48:37',NULL,'2026-08-08 04:46:38','2026-08-08 04:48:37'),(27,'App\\Models\\Customer',3,'customer_token','0bdcae979ad2a6324ddc67891551a30bf936d48dbb6d35c1a3aaa3c7926e4c0d','[\"*\"]',NULL,NULL,'2026-08-08 04:49:26','2026-08-08 04:49:26'),(28,'App\\Models\\User',4,'auth_token','78e7369429924da85dfe0a63e1e8302efa448daee0db10db086fbab18fb9bdc9','[\"*\"]','2026-08-08 04:52:42',NULL,'2026-08-08 04:50:43','2026-08-08 04:52:42'),(29,'App\\Models\\Customer',3,'customer_token','447bf2b2d3aba1ad067122891363a677a48851ab662822edfbfbd4e59e31be74','[\"*\"]',NULL,NULL,'2026-08-08 05:02:46','2026-08-08 05:02:46'),(30,'App\\Models\\User',4,'auth_token','1eded414cc133678976251343ac2910db4a024a511487ae7ac67352e994a80dc','[\"*\"]',NULL,NULL,'2026-08-08 05:11:20','2026-08-08 05:11:20'),(31,'App\\Models\\Customer',3,'customer_token','7d81e73a58fa90d7fd7093ada1443bb9049b5fdc7b704957e9583d694ccbb901','[\"*\"]',NULL,NULL,'2026-08-08 05:22:30','2026-08-08 05:22:30'),(32,'App\\Models\\Customer',3,'customer_token','2d43bf30f0dfe84a5d2fef647f191ee31032e50980dc4f2c6e591e8fc51656d3','[\"*\"]',NULL,NULL,'2026-08-08 06:11:11','2026-08-08 06:11:11'),(33,'App\\Models\\Customer',3,'customer_token','f7a4cd14f13c05bda7c85bc7e68ee067d17d6a20d98fc031692a3fd92806c4d6','[\"*\"]',NULL,NULL,'2026-08-08 06:37:17','2026-08-08 06:37:17'),(34,'App\\Models\\Customer',3,'customer_token','04ae94ef7884145bc9976702f765eb13150859abdb262528ff0978b6e43822eb','[\"*\"]','2026-08-08 07:18:25',NULL,'2026-08-08 07:13:24','2026-08-08 07:18:25'),(35,'App\\Models\\User',4,'auth_token','9b06be99358314037f040cac11880494483cd359ab8b4a6c5b521ca61b68bb47','[\"*\"]','2026-08-08 07:37:25',NULL,'2026-08-08 07:26:23','2026-08-08 07:37:25'),(36,'App\\Models\\User',4,'auth_token','3edd8d4ac5e2c8ff668c994d8b991938ce3b472ed39e25bec168f8d26592c4bb','[\"*\"]','2026-08-08 08:01:28',NULL,'2026-08-08 07:56:34','2026-08-08 08:01:28'),(37,'App\\Models\\User',7,'staff','5081462a62d50fe7e5347a839fc5840fad2b07ece41e355196f2c16cb2102234','[\"*\"]','2026-08-08 08:26:51',NULL,'2026-08-08 08:26:48','2026-08-08 08:26:51'),(38,'App\\Models\\Customer',4,'customer_token','d6ac9d6d8715abfd9b1ff50034de81593c1567f052747d1205444b4646362a99','[\"*\"]','2026-08-09 23:51:23',NULL,'2026-08-09 23:50:57','2026-08-09 23:51:23'),(39,'App\\Models\\User',8,'auth_token','5c89289bc5ff53a8b2e3d2c1e35be18eb8958415ca572b686f75e784ce9083e5','[\"*\"]','2026-08-09 23:54:58',NULL,'2026-08-09 23:52:39','2026-08-09 23:54:58'),(40,'App\\Models\\Customer',4,'customer_token','2eb1d4799a38d0148e4781fefef2caf361769a8cf85a1f29e3c23a000ad65d45','[\"*\"]','2026-08-09 23:55:46',NULL,'2026-08-09 23:55:22','2026-08-09 23:55:46'),(41,'App\\Models\\User',8,'auth_token','e98a4ea2d4a31d3ee8fc131e47031f97a485f1719ba38233248dbfe24bb68b06','[\"*\"]','2026-08-09 23:56:11',NULL,'2026-08-09 23:56:01','2026-08-09 23:56:11'),(47,'App\\Models\\User',8,'auth_token','941700f07d141af6e5eb1ddd82246acfc241fafc90c9fb9e18050aa059f4ce52','[\"*\"]','2026-08-10 03:23:28',NULL,'2026-08-10 03:23:11','2026-08-10 03:23:28'),(62,'App\\Models\\User',8,'auth_token','aa0e75779a236fe8aba13decead74cbf56a0b11c377bde807c83438625d3dfc6','[\"*\"]','2026-08-10 08:10:55',NULL,'2026-08-10 06:58:02','2026-08-10 08:10:55'),(81,'App\\Models\\Customer',4,'customer_token','fff7d858e81c31e51ee4b0e20c18f234dec9eba3f9d1df278bde3ca32b050b05','[\"*\"]','2026-08-11 02:49:07',NULL,'2026-08-11 02:25:58','2026-08-11 02:49:07'),(88,'App\\Models\\Customer',4,'customer_token','8b473fd0f70774b5907d1e12ffbffa7b22ac490142721cecb7336f0a29c2790c','[\"*\"]',NULL,NULL,'2026-08-11 07:19:32','2026-08-11 07:19:32'),(94,'App\\Models\\User',8,'auth_token','20f55048d28d14324e6161e879cbb72497f1df207a9834c293c64169a0bc41c1','[\"*\"]','2026-08-12 01:58:24',NULL,'2026-08-12 01:52:37','2026-08-12 01:58:24'),(163,'App\\Models\\User',11,'staff','6ce79413c0419b70d00fc5955e45d642b789cdec3f14df8a998f5a33dfbe5f50','[\"*\"]','2026-08-18 01:48:12',NULL,'2026-08-18 01:19:59','2026-08-18 01:48:12'),(165,'App\\Models\\Customer',4,'customer_token','7ab14a354fe254ffac709bfdaf175a1233dd2f349bd6c8f57d73a99bc829c978','[\"*\"]',NULL,NULL,'2026-08-18 01:21:03','2026-08-18 01:21:03');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reservations`
--

DROP TABLE IF EXISTS `reservations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `restaurant_id` bigint unsigned NOT NULL,
  `customer_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guests` int unsigned NOT NULL,
  `reservation_date` date NOT NULL,
  `reservation_time` time NOT NULL,
  `special_requests` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reservations_restaurant_id_foreign` (`restaurant_id`),
  CONSTRAINT `reservations_restaurant_id_foreign` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservations`
--

LOCK TABLES `reservations` WRITE;
/*!40000 ALTER TABLE `reservations` DISABLE KEYS */;
INSERT INTO `reservations` VALUES (1,5,'Raj','9874563210','Rajnish@gmail.com',5,'2026-08-19','14:27:00','Give Your Best','confirmed','2026-08-13 02:27:38','2026-08-13 02:43:58'),(2,5,'Rajnish Sharma','9874563210','rajnishh.off@gmail.com',2,'2026-08-15','20:24:00','wowwwww','cancelled','2026-08-14 08:24:21','2026-08-14 08:27:09');
/*!40000 ALTER TABLE `reservations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurant_contact_settings`
--

DROP TABLE IF EXISTS `restaurant_contact_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurant_contact_settings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `restaurant_id` bigint unsigned NOT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `working_hours` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `facebook_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `instagram_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `twitter_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `youtube_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `restaurant_contact_settings_restaurant_id_unique` (`restaurant_id`),
  CONSTRAINT `restaurant_contact_settings_restaurant_id_foreign` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurant_contact_settings`
--

LOCK TABLES `restaurant_contact_settings` WRITE;
/*!40000 ALTER TABLE `restaurant_contact_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `restaurant_contact_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurant_marquee_items`
--

DROP TABLE IF EXISTS `restaurant_marquee_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurant_marquee_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `restaurant_id` bigint unsigned NOT NULL,
  `text` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int unsigned NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `restaurant_marquee_items_restaurant_id_foreign` (`restaurant_id`),
  CONSTRAINT `restaurant_marquee_items_restaurant_id_foreign` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurant_marquee_items`
--

LOCK TABLES `restaurant_marquee_items` WRITE;
/*!40000 ALTER TABLE `restaurant_marquee_items` DISABLE KEYS */;
INSERT INTO `restaurant_marquee_items` VALUES (2,5,'Spicy Chicken Wings',0,1,'2026-08-13 06:37:04','2026-08-13 06:37:04'),(3,5,'Cheesy Garlic Bread',1,1,'2026-08-13 06:37:14','2026-08-13 06:37:14'),(4,5,'Classic Hot Dogs',2,1,'2026-08-13 06:37:21','2026-08-13 06:37:21'),(5,5,'Loaded Nachos',3,1,'2026-08-13 06:37:29','2026-08-13 06:37:29'),(6,5,'Peri Peri Fries',4,0,'2026-08-13 06:37:36','2026-08-13 06:38:31'),(7,5,'Crispy Chicken Nuggets',5,1,'2026-08-13 06:37:43','2026-08-13 06:37:43'),(8,5,'Mexican Tacos',6,1,'2026-08-13 06:37:52','2026-08-13 06:37:52'),(9,5,'Spicy Chicken Wings',0,1,'2026-08-13 07:00:19','2026-08-13 07:00:19'),(10,5,'Cheesy Garlic Bread',1,1,'2026-08-13 07:00:26','2026-08-13 07:00:26'),(11,5,'Classic Hot Dogs',2,1,'2026-08-13 07:00:36','2026-08-13 07:00:36'),(12,5,'Signature Mountain Brew',0,1,'2026-08-13 08:34:34','2026-08-13 08:34:34'),(13,5,'Freshly Baked Croissants',1,1,'2026-08-13 08:34:48','2026-08-13 08:34:48'),(14,5,'Artisan Pastries',2,1,'2026-08-13 08:34:56','2026-08-13 08:34:56'),(15,5,'Classic English Breakfast',3,1,'2026-08-13 08:35:02','2026-08-13 08:35:02'),(16,5,'Gourmet Wood-Fired Pizza',4,1,'2026-08-13 08:35:10','2026-08-13 08:35:10'),(17,5,'Creamy Mountain Pasta',5,1,'2026-08-13 08:35:18','2026-08-13 08:35:18'),(18,5,'Grilled Chicken Sandwich',6,1,'2026-08-13 08:35:30','2026-08-13 08:35:30'),(19,5,'Homestyle Chocolate Cake',7,1,'2026-08-13 08:35:36','2026-08-13 08:35:36'),(20,5,'Fresh Fruit Pancakes',8,1,'2026-08-13 08:35:43','2026-08-13 08:35:43'),(21,5,'Special Himalayan Hot Chocolate',9,1,'2026-08-13 08:35:49','2026-08-13 08:35:49');
/*!40000 ALTER TABLE `restaurant_marquee_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurant_stories`
--

DROP TABLE IF EXISTS `restaurant_stories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurant_stories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `restaurant_id` bigint unsigned NOT NULL,
  `label` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Our Story',
  `years` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `main_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `secondary_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `feature_1_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `feature_1_description` text COLLATE utf8mb4_unicode_ci,
  `feature_1_icon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `feature_2_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `feature_2_description` text COLLATE utf8mb4_unicode_ci,
  `feature_2_icon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `feature_3_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `feature_3_description` text COLLATE utf8mb4_unicode_ci,
  `feature_3_icon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `restaurant_stories_restaurant_id_unique` (`restaurant_id`),
  CONSTRAINT `restaurant_stories_restaurant_id_foreign` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurant_stories`
--

LOCK TABLES `restaurant_stories` WRITE;
/*!40000 ALTER TABLE `restaurant_stories` DISABLE KEYS */;
/*!40000 ALTER TABLE `restaurant_stories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurants`
--

DROP TABLE IF EXISTS `restaurants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurants` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `about_years` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `about_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `about_description` text COLLATE utf8mb4_unicode_ci,
  `about_image_1` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `about_image_2` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `about_feature_1_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `about_feature_1_description` text COLLATE utf8mb4_unicode_ci,
  `about_feature_2_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `about_feature_2_description` text COLLATE utf8mb4_unicode_ci,
  `about_feature_3_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `about_feature_3_description` text COLLATE utf8mb4_unicode_ci,
  `hero_badge` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hero_title_line_1` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hero_title_line_2` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hero_title_line_3` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hero_title_line_4` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hero_description` text COLLATE utf8mb4_unicode_ci,
  `hero_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hero_owner_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hero_deal_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hero_deal_subtitle` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hero_delivery_time` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hero_delivery_subtitle` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hero_rating` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hero_reviews` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hero_explore_button` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hero_story_button` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hero_customers_count` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hero_menu_count` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hero_chefs_count` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hero_experience_count` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `restaurants_slug_unique` (`slug`),
  UNIQUE KEY `restaurants_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurants`
--

LOCK TABLES `restaurants` WRITE;
/*!40000 ALTER TABLE `restaurants` DISABLE KEYS */;
INSERT INTO `restaurants` VALUES (1,'raj','raj-1786086696',NULL,'7896541230','Rajnish@gmail.com',NULL,1,'2026-08-07 01:41:36','2026-08-13 03:32:45','12+','We Invite You to Visit','Our restaurant serves delicious food with passion.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(5,'Musfir cafe','owner-1786339339',NULL,'9876543210','owner2@gmail.com','Jharipani Castle in Jharipani, Mussoorie, Uttarakhand',1,'2026-08-09 23:52:19','2026-08-13 23:47:17','5+',NULL,NULL,'restaurants/about/midNbf4Og3iNAPPbPIlkujIsDKW2yEXYSHzH6FmF.jpg','restaurants/about/zaooZkdCPZQtKatqcxPX43jVr6DtdM7C6eMxyZsL.jpg',NULL,NULL,NULL,NULL,NULL,NULL,'A Taste Worth the Journey','WELCOME TO','MUSAFIR','CAFE',NULL,'From crispy fried chicken and gourmet burgers to artisan pizzas, loaded fries, wraps, shakes, and more — Musafir Cafe brings together delicious flavors for every kind of food lover.','restaurants/hero/JiX6QXDzs4CtzVpawMZ6SpuUSsW1AHIidjRHDAcy.webp','Meet the Musafir Family','Delicious Deals','Big Flavours. Great Value.','30–40 Minutes','Fresh & Fast Delivery','4.8 ★','Loved by 1,000+ Foodies',NULL,NULL,'10K+','50+','10+','5+ Years'),(6,'Zaika','zaika-1786446336',NULL,'9874563210','owner@gmail.com',NULL,1,'2026-08-11 05:35:36','2026-08-11 05:35:36',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `restaurants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `restaurant_id` bigint unsigned NOT NULL,
  `customer_id` bigint unsigned NOT NULL,
  `rating` tinyint unsigned NOT NULL,
  `review` text COLLATE utf8mb4_unicode_ci,
  `is_visible` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reviews_customer_id_foreign` (`customer_id`),
  KEY `reviews_restaurant_id_rating_index` (`restaurant_id`,`rating`),
  CONSTRAINT `reviews_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_restaurant_id_foreign` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (3,5,4,5,'Very Good Cheese burger',1,'2026-08-09 23:55:46','2026-08-14 08:27:24'),(4,1,4,5,'Wowwwwwwwww',1,'2026-08-11 02:48:55','2026-08-11 02:48:55'),(5,5,5,4,'It just Average',1,'2026-08-13 23:45:50','2026-08-14 08:27:22');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `restaurant_id` bigint unsigned DEFAULT NULL,
  `owner_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('super_admin','owner','staff','customer') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'owner',
  `staff_role` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profile_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_username_unique` (`username`),
  KEY `users_restaurant_id_foreign` (`restaurant_id`),
  CONSTRAINT `users_restaurant_id_foreign` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (5,NULL,'Super Admin','admin@advanta.com',NULL,'9999999999',NULL,'$2y$12$erKc4K.3MUvY98P.oRdT0.BUCKweZIKpteYFriW7zwoaczGBD3hBq','super_admin',NULL,NULL,1,NULL,'2026-08-07 04:28:53','2026-08-07 06:05:01'),(8,5,'Owner','owner2@gmail.com',NULL,'9632587410',NULL,'$2y$12$h5avGrizBrYml4eAGSWMQuqEYoBF7UPVD3sXNpp43qdb056avgxbi','owner',NULL,NULL,1,NULL,'2026-08-09 23:52:19','2026-08-09 23:52:19'),(9,5,'Cashier Boy','Cashier@gmail.com','cashier01','9876543210',NULL,'$2y$12$2SfWBlmFMvgVMWWY3Xcko.h7yeCemjYmHSM/pcO/iGizRXsFn23K.','staff','Cashier','staff-profiles/uWT5Dc5fNqlyPspwWrtpNF8xHeb6u6E1rZ2Zu5xs.jpg',1,NULL,'2026-08-09 23:54:37','2026-08-17 08:31:10'),(10,6,'Rajnish','owner@gmail.com',NULL,'9874563210',NULL,'$2y$12$Qph6wZklXWHjnEmWqTl..OjyaO7z4Tt1zK2RhKG7HSm/FsIws38zG','owner',NULL,NULL,1,NULL,'2026-08-11 05:35:36','2026-08-11 05:35:36'),(11,5,'Manager','Rajnish@gmail.com','manager01','7896541230',NULL,'$2y$12$2YRWr2jnSL5FINF0rs/f/O0PHgozZbqZH9G7S/DJXk63EN5dlhwyu','staff','Manager','staff-profiles/L96UhvSZcnCFQki3g9qu5wKAk7ELqlYyt05RpSHk.jpg',1,NULL,'2026-08-12 01:53:26','2026-08-17 07:59:55'),(13,5,'Cheffffffff','chef@gmail.com','chef01','7896541230',NULL,'$2y$12$GWA9wpyO6bnWSHeT1RhkreCal1/FALe8cdNu1pRzZxu.g8zdapOF6','staff','Chef','staff-profiles/1a6X2lhoXB2i3YhVcN3j7J10ZNK6UhPDv4w2gSrk.jpg',1,NULL,'2026-08-17 06:50:51','2026-08-17 08:10:43'),(14,5,'Delivery Boy','delivery@gmail.com','delivery01','9874563210',NULL,'$2y$12$JQ.PdSjjlTLpuLTmfXBqM.WNuyZMcdRfwvlnQvoP/lJW0VM/41LKi','staff','Delivery Boy','staff-profiles/0ZhLCmtWEGh4ZMirsXutCGZ7xqy38Osjc2KortBF.jpg',1,NULL,'2026-08-17 07:58:40','2026-08-17 07:58:40'),(15,5,'Waiterrr','waiter@gmail.com','waiter01','9955795489',NULL,'$2y$12$QxJeIJShLeosBvEntWnrferTl.oZ6uZJ2kxJSsyVF118HOYbUIukm','staff','Waiter','staff-profiles/J4UnxP2TDjtrntqm8C5p7h76mFoRqCI9DwcllGV0.jpg',1,NULL,'2026-08-17 08:01:34','2026-08-17 08:01:34');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-18 13:27:16
