-- Complete Database Tables Creation Script
-- Run this script to create all necessary tables for the Monev project
-- Only includes tables that are actually used by the endpoints
-- This script creates tables for both monev_db and moodle_logs databases

-- =====================================================
-- PART 1: MONEV_DB DATABASE TABLES
-- =====================================================

-- Switch to monev_db database
USE monev_db;

-- 1. users table (for authentication) - USED BY: authService.js
CREATE TABLE IF NOT EXISTS monev_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,   -- untuk login
  password VARCHAR(255) NOT NULL,          -- disimpan dalam bentuk hash
  sub VARCHAR(50) NOT NULL UNIQUE,         -- bisa jadi ID/NIM
  name VARCHAR(100) NOT NULL,              -- nama lengkap
  kampus VARCHAR(100),                     -- opsional
  fakultas VARCHAR(100),                   -- opsional
  prodi VARCHAR(100),                      -- opsional
  admin BOOLEAN DEFAULT FALSE,             -- true = admin, false = user
  exp BIGINT,                              -- token expiration (UNIX time)
  iat BIGINT,                              -- token issued at (UNIX time)
  message TEXT,                            -- pesan
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. course_activity_summary table - USED BY: course-performance.js
CREATE TABLE IF NOT EXISTS `monev_cp_activity_summary` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `course_id` bigint(20) NOT NULL,
  `section` int(11) DEFAULT NULL,
  `activity_id` bigint(20) NOT NULL,
  `activity_type` varchar(50) NOT NULL,
  `activity_name` varchar(255) NOT NULL,
  `accessed_count` int(11) DEFAULT 0,
  `submission_count` int(11) DEFAULT NULL,
  `graded_count` int(11) DEFAULT NULL,
  `attempted_count` int(11) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_course_id` (`course_id`),
  KEY `idx_activity_type` (`activity_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. student_profile table - USED BY: course-performance.js
CREATE TABLE IF NOT EXISTS `monev_cp_student_profile` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `idnumber` varchar(255) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `program_studi` varchar(255) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `idx_idnumber` (`idnumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. student_quiz_detail table - USED BY: course-performance.js
CREATE TABLE IF NOT EXISTS `monev_cp_student_quiz_detail` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `quiz_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `nim` varchar(255) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `waktu_mulai` datetime DEFAULT NULL,
  `waktu_selesai` datetime DEFAULT NULL,
  `durasi_waktu` time DEFAULT NULL,
  `jumlah_soal` int(11) DEFAULT NULL,
  `jumlah_dikerjakan` int(11) DEFAULT NULL,
  `nilai` decimal(5,2) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_quiz_id` (`quiz_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_nim` (`nim`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. student_assignment_detail table - USED BY: course-performance.js
CREATE TABLE IF NOT EXISTS `monev_cp_student_assignment_detail` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `assignment_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `nim` varchar(255) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `waktu_submit` datetime DEFAULT NULL,
  `waktu_pengerjaan` time DEFAULT NULL,
  `nilai` decimal(5,2) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_assignment_id` (`assignment_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_nim` (`nim`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. student_resource_access table - USED BY: course-performance.js
CREATE TABLE IF NOT EXISTS `monev_cp_student_resource_access` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `resource_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `nim` varchar(255) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `waktu_akses` datetime DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_resource_id` (`resource_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_nim` (`nim`),
  KEY `idx_waktu_akses` (`waktu_akses`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. course_summary table - USED BY: course-performance.js
CREATE TABLE IF NOT EXISTS `monev_cp_course_summary` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `course_id` bigint(20) NOT NULL,
  `course_name` varchar(255) NOT NULL,
  `kelas` varchar(100) DEFAULT NULL,
  `jumlah_aktivitas` int(11) DEFAULT 0,
  `jumlah_mahasiswa` int(11) DEFAULT 0,
  `dosen_pengampu` text DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `course_id` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. monev_cp_fetch_logs table (for tracking fetch from celoeapi-backend runs) - USED BY: etlService.js, course-performance.js
CREATE TABLE IF NOT EXISTS `monev_cp_fetch_logs` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `offset` int(10) NOT NULL DEFAULT 0,
  `numrow` int(10) NOT NULL DEFAULT 0,
  `status` tinyint(1) NOT NULL COMMENT '1=finished, 2=inprogress, 3=failed',
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_start_date` (`start_date`),
  KEY `idx_end_date` (`end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- SAS
-- 10. monev_sas_categories table - USED BY: student-activity-summary.js
CREATE TABLE IF NOT EXISTS monev_sas_categories (
    category_id INT PRIMARY KEY,
    category_name VARCHAR(255) NOT NULL,
    category_site VARCHAR(50),
    category_type ENUM('FACULTY', 'STUDYPROGRAM', 'DEPARTMENT', 'OTHER') NOT NULL,
    category_parent_id INT DEFAULT NULL,
    INDEX idx_category_type (category_type),
    INDEX idx_category_parent (category_parent_id),
    FOREIGN KEY (category_parent_id) REFERENCES monev_sas_categories(category_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. monev_sas_subjects table - USED BY: student-activity-summary.js
CREATE TABLE IF NOT EXISTS monev_sas_subjects (
    subject_id INT PRIMARY KEY,
    subject_code VARCHAR(20) NOT NULL UNIQUE,
    subject_name VARCHAR(255) NOT NULL,
    curriculum_year YEAR NOT NULL,
    category_id INT NOT NULL,
    INDEX idx_subject_code (subject_code),
    INDEX idx_curriculum_year (curriculum_year),
    INDEX idx_category_id (category_id),
    FOREIGN KEY (category_id) REFERENCES monev_sas_categories(category_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. monev_sas_fetch_logs table (for tracking fetch from api runs) - USED BY: student-activity-summary.js
CREATE TABLE IF NOT EXISTS monev_sas_fetch_categories_subject_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    start_date DATETIME,
    end_date DATETIME,
    duration VARCHAR(20),
    status VARCHAR(20),
    total_records INT,
    offset INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_start_date (start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Show monev_db tables
SELECT 'monev_db' as database_name, TABLE_NAME as table_name FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'monev_db';


-- =====================================================
-- SUMMARY
-- =====================================================

-- Show all created tables from monev_db
SELECT 'monev_db' as database_name, TABLE_NAME as table_name FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'monev_db';