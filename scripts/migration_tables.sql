-- -------------------------------------------------------------
-- TablePlus 6.6.8(632)
--
-- https://tableplus.com/
--
-- Database: monev_db
-- Generation Time: 2025-08-21 12:22:00.4040
-- -------------------------------------------------------------


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


CREATE TABLE IF NOT EXISTS `monev_cp_activity_summary` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_id` bigint NOT NULL,
  `section` int DEFAULT NULL,
  `activity_id` bigint NOT NULL,
  `activity_type` varchar(50) NOT NULL,
  `activity_name` varchar(255) NOT NULL,
  `accessed_count` int DEFAULT '0',
  `submission_count` int DEFAULT NULL,
  `graded_count` int DEFAULT NULL,
  `attempted_count` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_course_id` (`course_id`),
  KEY `idx_activity_type` (`activity_type`)
) ENGINE=InnoDB AUTO_INCREMENT=2410 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `monev_cp_course_summary` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_id` bigint NOT NULL,
  `course_name` varchar(255) NOT NULL,
  `kelas` varchar(100) DEFAULT NULL,
  `jumlah_aktivitas` int DEFAULT '0',
  `jumlah_mahasiswa` int DEFAULT '0',
  `dosen_pengampu` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `course_id` (`course_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5447 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `monev_cp_fetch_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `offset` int NOT NULL DEFAULT '0',
  `numrow` int NOT NULL DEFAULT '0',
  `status` tinyint(1) NOT NULL COMMENT '1=finished, 2=inprogress, 3=failed',
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_start_date` (`start_date`),
  KEY `idx_end_date` (`end_date`)
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `monev_cp_student_assignment_detail` (
  `id` int NOT NULL AUTO_INCREMENT,
  `assignment_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `nim` varchar(255) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `waktu_submit` datetime DEFAULT NULL,
  `waktu_pengerjaan` time DEFAULT NULL,
  `nilai` decimal(5,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_assignment_id` (`assignment_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_nim` (`nim`)
) ENGINE=InnoDB AUTO_INCREMENT=471 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `monev_cp_student_profile` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `idnumber` varchar(255) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `program_studi` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `idx_idnumber` (`idnumber`)
) ENGINE=InnoDB AUTO_INCREMENT=2297 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `monev_cp_student_quiz_detail` (
  `id` int NOT NULL AUTO_INCREMENT,
  `quiz_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `nim` varchar(255) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `waktu_mulai` datetime DEFAULT NULL,
  `waktu_selesai` datetime DEFAULT NULL,
  `durasi_waktu` time DEFAULT NULL,
  `jumlah_soal` int DEFAULT NULL,
  `jumlah_dikerjakan` int DEFAULT NULL,
  `nilai` decimal(5,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_quiz_id` (`quiz_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_nim` (`nim`)
) ENGINE=InnoDB AUTO_INCREMENT=389 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `monev_cp_student_resource_access` (
  `id` int NOT NULL AUTO_INCREMENT,
  `resource_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `nim` varchar(255) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `waktu_akses` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_resource_id` (`resource_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_nim` (`nim`),
  KEY `idx_waktu_akses` (`waktu_akses`)
) ENGINE=InnoDB AUTO_INCREMENT=693 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `monev_sas_activity_counts_etl` (
  `id` int NOT NULL AUTO_INCREMENT,
  `courseid` int NOT NULL,
  `file_views` int DEFAULT '0',
  `video_views` int DEFAULT '0',
  `forum_views` int DEFAULT '0',
  `quiz_views` int DEFAULT '0',
  `assignment_views` int DEFAULT '0',
  `url_views` int DEFAULT '0',
  `active_days` int DEFAULT '0',
  `extraction_date` date NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_courseid` (`courseid`),
  KEY `idx_extraction_date` (`extraction_date`)
) ENGINE=InnoDB AUTO_INCREMENT=329 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `monev_sas_categories` (
  `category_id` int NOT NULL,
  `category_name` varchar(255) NOT NULL,
  `category_site` varchar(50) DEFAULT NULL,
  `category_type` enum('FACULTY','STUDYPROGRAM','DEPARTMENT','OTHER') NOT NULL,
  `category_parent_id` int DEFAULT NULL,
  PRIMARY KEY (`category_id`),
  KEY `idx_category_type` (`category_type`),
  KEY `idx_category_parent` (`category_parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `monev_sas_courses` (
  `course_id` int NOT NULL,
  `subject_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `course_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `course_shortname` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `faculty_id` int DEFAULT NULL,
  `program_id` int DEFAULT NULL,
  `visible` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`course_id`),
  UNIQUE KEY `uk_subject_id` (`subject_id`),
  KEY `idx_program_id` (`program_id`),
  KEY `idx_faculty_id` (`faculty_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `monev_sas_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type_run` enum('fetch_category_subject','fetch_course_performance','fetch_student_activity_summary') NOT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `duration` varchar(20) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `total_records` int DEFAULT NULL,
  `offset` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_start_date` (`start_date`),
  KEY `idx_type_run` (`type_run`),
  KEY `idx_type_status` (`type_run`,`status`)
) ENGINE=InnoDB AUTO_INCREMENT=272 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `monev_sas_realtime_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `log_id` int NOT NULL,
  `level` enum('info','warning','error','debug','progress') NOT NULL,
  `message` text,
  `progress` int DEFAULT NULL,
  `data` json DEFAULT NULL,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_log_id` (`log_id`),
  KEY `idx_level` (`level`),
  KEY `idx_timestamp` (`timestamp`),
  CONSTRAINT `monev_sas_realtime_logs_ibfk_1` FOREIGN KEY (`log_id`) REFERENCES `monev_sas_logs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18116 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `monev_sas_subjects` (
  `subject_id` int NOT NULL,
  `subject_code` varchar(20) NOT NULL,
  `subject_name` varchar(255) NOT NULL,
  `curriculum_year` year NOT NULL,
  `category_id` int NOT NULL,
  PRIMARY KEY (`subject_id`),
  KEY `idx_subject_code` (`subject_code`),
  KEY `idx_curriculum_year` (`curriculum_year`),
  KEY `idx_category_id` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `monev_sas_user_activity_etl` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `num_teachers` int DEFAULT '0',
  `num_students` int DEFAULT '0',
  `file_views` int DEFAULT '0',
  `video_views` int DEFAULT '0',
  `forum_views` int DEFAULT '0',
  `quiz_views` int DEFAULT '0',
  `assignment_views` int DEFAULT '0',
  `url_views` int DEFAULT '0',
  `total_views` int DEFAULT '0',
  `avg_activity_per_student_per_day` decimal(10,2) DEFAULT NULL,
  `active_days` int DEFAULT '0',
  `extraction_date` date NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_unique_course_date` (`course_id`,`extraction_date`),
  KEY `idx_course_id` (`course_id`),
  KEY `idx_extraction_date` (`extraction_date`),
  CONSTRAINT `fk_monev_sas_user_activity_course` FOREIGN KEY (`course_id`) REFERENCES `monev_sas_courses` (`course_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=507 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `monev_sas_user_counts_etl` (
  `id` int NOT NULL AUTO_INCREMENT,
  `courseid` int NOT NULL,
  `num_students` int DEFAULT '0',
  `num_teachers` int DEFAULT '0',
  `extraction_date` date NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_courseid` (`courseid`),
  KEY `idx_extraction_date` (`extraction_date`)
) ENGINE=InnoDB AUTO_INCREMENT=351 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `monev_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sub` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kampus` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fakultas` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `prodi` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `admin` tinyint(1) DEFAULT '0',
  `exp` bigint DEFAULT NULL,
  `iat` bigint DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `sub` (`sub`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table for storing SAS users login activity ETL data
CREATE TABLE IF NOT EXISTS `monev_sas_users_login_activity_etl` (
  `id` int NOT NULL AUTO_INCREMENT,
  `response_id` bigint(20) NOT NULL,
  `extraction_date` date NOT NULL,
  `hour` tinyint(2) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `username` varchar(100) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `login_count` int(11) DEFAULT 0,
  `first_login_time` bigint(20) DEFAULT NULL,
  `last_login_time` bigint(20) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `firstname` varchar(100) NOT NULL,
  `lastname` varchar(100) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `lastaccess` bigint(20) DEFAULT NULL,
  `idnumber` varchar(255) DEFAULT NULL,
  `firstaccess` bigint(20) DEFAULT NULL,
  `lastlogin` bigint(20) DEFAULT NULL,
  `currentlogin` bigint(20) DEFAULT NULL,
  `role_id` bigint(20) DEFAULT NULL,
  `role_name` varchar(100) DEFAULT NULL,
  `role_shortname` varchar(50) DEFAULT NULL,
  `course_id` bigint(20) DEFAULT NULL,
  `context_id` bigint(20) DEFAULT NULL,
  `context_level` int(11) DEFAULT NULL,
  `enrolid` bigint(20) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_unique_user_hour_extraction` (`user_id`, `hour`, `extraction_date`),
  KEY `idx_extraction_date` (`extraction_date`),
  KEY `idx_hour` (`hour`),
  KEY `idx_username` (`username`),
  KEY `idx_course_id` (`course_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_email` (`email`),
  KEY `idx_lastaccess` (`lastaccess`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `monev_sas_user_login_etl_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type_run` enum('execute_get_data_with_pagination') NOT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `duration` varchar(20) DEFAULT NULL,
  `status` enum('success','failed','in_progress') DEFAULT 'in_progress',
  `total_records` int DEFAULT NULL,
  `offset` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_type_run` (`type_run`),
  KEY `idx_status` (`status`),
  KEY `idx_start_date` (`start_date`),
  KEY `idx_end_date` (`end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping structure for table celoeapi.sp_etl_detail
DROP TABLE IF EXISTS `monev_sp_etl_detail`;
CREATE TABLE IF NOT EXISTS `monev_sp_etl_detail` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `response_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL COMMENT 'Moodle user ID',
  `course_id` bigint(20) NOT NULL COMMENT 'Moodle course ID',
  `course_name` varchar(254) NOT NULL COMMENT 'Course full name',
  `module_type` varchar(50) NOT NULL COMMENT 'Module type (mod_quiz, mod_assign, mod_forum)',
  `module_name` varchar(255) NOT NULL DEFAULT '' COMMENT 'Name of the module (quiz name, forum name, assignment name)',
  `object_id` bigint(20) DEFAULT NULL COMMENT 'Object ID (forum_id, assign_id, quiz_id)',
  `grade` decimal(10,2) DEFAULT NULL COMMENT 'Grade for this module (nullable)',
  `timecreated` bigint(20) DEFAULT NULL COMMENT 'Unix timestamp from Moodle log',
  `log_id` bigint(20) DEFAULT NULL COMMENT 'Moodle log entry ID',
  `action_type` varchar(50) DEFAULT NULL COMMENT 'Action type from Moodle log (viewed, created, updated, etc.)',
  `extraction_date` date NOT NULL COMMENT 'Date for which data was extracted',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_course_module_object_timecreated_log_date` (`user_id`,`course_id`,`module_type`,`object_id`,`timecreated`,`log_id`,`extraction_date`,`response_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_course_id` (`course_id`),
  KEY `idx_module_type` (`module_type`),
  KEY `idx_object_id` (`object_id`),
  KEY `idx_extraction_date` (`extraction_date`),
  KEY `idx_user_course_module` (`user_id`,`course_id`,`module_type`),
  KEY `idx_response_id` (`response_id`)
) ENGINE=InnoDB AUTO_INCREMENT=625 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table celoeapi.sp_etl_summary
DROP TABLE IF EXISTS `monev_sp_etl_summary`;
CREATE TABLE IF NOT EXISTS `monev_sp_etl_summary` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `response_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL COMMENT 'Moodle user ID',
  `username` varchar(100) NOT NULL COMMENT 'User username',
  `firstname` varchar(100) NOT NULL COMMENT 'User first name',
  `lastname` varchar(100) NOT NULL COMMENT 'User last name',
  `total_course` int(11) NOT NULL DEFAULT 0 COMMENT 'Total number of courses enrolled',
  `total_login` int(11) NOT NULL DEFAULT 0 COMMENT 'Total number of login days',
  `total_activities` int(11) NOT NULL DEFAULT 0 COMMENT 'Total number of activities performed',
  `extraction_date` date NOT NULL COMMENT 'Date for which data was extracted',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_date` (`user_id`,`extraction_date`,`response_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_username` (`username`),
  KEY `idx_extraction_date` (`extraction_date`),
  KEY `idx_total_course` (`total_course`),
  KEY `idx_total_activities` (`total_activities`),
  KEY `idx_user_date_activities` (`user_id`,`extraction_date`,`total_activities`),
  KEY `idx_response_id` (`response_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table for storing SP ETL logs
DROP TABLE IF EXISTS `monev_sp_etl_logs`;
CREATE TABLE IF NOT EXISTS `monev_sp_etl_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type_run` enum('execute_run_sp_etl','execute_sp_etl_summary','execute_sp_etl_detail') NOT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `duration` varchar(20) DEFAULT NULL,
  `status` enum('success','failed','in_progress') DEFAULT 'in_progress',
  `total_records` int DEFAULT NULL,
  `offset` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_type_run` (`type_run`),
  KEY `idx_status` (`status`),
  KEY `idx_start_date` (`start_date`),
  KEY `idx_end_date` (`end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `monev_tp_etl_summary` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL COMMENT 'Moodle user ID',
  `username` varchar(100) NOT NULL COMMENT 'User username',
  `firstname` varchar(100) NOT NULL COMMENT 'User first name',
  `lastname` varchar(100) NOT NULL COMMENT 'User last name',
  `email` varchar(100) NOT NULL COMMENT 'User email address',
  `total_courses_taught` int(11) NOT NULL DEFAULT 0 COMMENT 'Total number of courses taught',
  `total_activities` int(11) NOT NULL DEFAULT 0 COMMENT 'Total number of activities performed',
  `forum_replies` int(11) NOT NULL DEFAULT 0 COMMENT 'Number of forum replies to students',
  `assignment_feedback_count` int(11) NOT NULL DEFAULT 0 COMMENT 'Number of assignment feedback given',
  `quiz_feedback_count` int(11) NOT NULL DEFAULT 0 COMMENT 'Number of quiz feedback given',
  `grading_count` int(11) NOT NULL DEFAULT 0 COMMENT 'Number of grading activities performed',
  `mod_assign_logs` int(11) NOT NULL DEFAULT 0 COMMENT 'Number of assignment module logs',
  `mod_forum_logs` int(11) NOT NULL DEFAULT 0 COMMENT 'Number of forum module logs',
  `mod_quiz_logs` int(11) NOT NULL DEFAULT 0 COMMENT 'Number of quiz module logs',
  `total_login` int(11) NOT NULL DEFAULT 0 COMMENT 'Total number of login days',
  `total_student_interactions` int(11) NOT NULL DEFAULT 0 COMMENT 'Total student interactions (forum + feedback + grading)',
  `extraction_date` date NOT NULL COMMENT 'Date for which data was extracted',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_date` (`user_id`,`extraction_date`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_username` (`username`),
  KEY `idx_email` (`email`),
  KEY `idx_extraction_date` (`extraction_date`),
  KEY `idx_total_courses_taught` (`total_courses_taught`),
  KEY `idx_total_activities` (`total_activities`),
  KEY `idx_total_student_interactions` (`total_student_interactions`),
  KEY `idx_forum_replies` (`forum_replies`),
  KEY `idx_assignment_feedback` (`assignment_feedback_count`),
  KEY `idx_quiz_feedback` (`quiz_feedback_count`),
  KEY `idx_grading_count` (`grading_count`),
  KEY `idx_user_date_interactions` (`user_id`,`extraction_date`,`total_student_interactions`),
  KEY `idx_user_date_courses` (`user_id`,`extraction_date`,`total_courses_taught`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `monev_tp_etl_logs` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `process_type` varchar(100) NOT NULL COMMENT 'ETL process type',
  `status` enum('running','completed','failed') NOT NULL DEFAULT 'running' COMMENT 'Process status',
  `message` text DEFAULT NULL COMMENT 'Process message or error details',
  `concurrency` int(11) NOT NULL DEFAULT 1 COMMENT 'Concurrency level used',
  `start_date` timestamp NULL DEFAULT current_timestamp() COMMENT 'Process start time',
  `end_date` timestamp NULL DEFAULT NULL COMMENT 'Process end time',
  `duration_seconds` int(11) DEFAULT NULL COMMENT 'Process duration in seconds',
  `total_records` int(11) DEFAULT 0 COMMENT 'Total records processed',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_process_type` (`process_type`),
  KEY `idx_status` (`status`),
  KEY `idx_start_date` (`start_date`),
  KEY `idx_concurrency` (`concurrency`),
  KEY `idx_total_records` (`total_records`),
  KEY `idx_process_type_status` (`process_type`,`status`),
  KEY `idx_start_date_process` (`start_date`,`process_type`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `monev_tp_etl_detail` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL COMMENT 'Moodle user ID',
  `username` varchar(100) NOT NULL COMMENT 'Username',
  `firstname` varchar(100) NOT NULL COMMENT 'First name',
  `lastname` varchar(100) NOT NULL COMMENT 'Last name',
  `email` varchar(100) NOT NULL COMMENT 'Email address',
  `course_id` bigint(20) NOT NULL COMMENT 'Moodle course ID',
  `course_name` varchar(255) NOT NULL COMMENT 'Course full name',
  `course_shortname` varchar(100) NOT NULL COMMENT 'Course short name',
  `activity_date` date NOT NULL COMMENT 'Date of activity',
  `component` varchar(100) DEFAULT NULL COMMENT 'Component (e.g., mod_assign, mod_forum)',
  `action` varchar(100) DEFAULT NULL COMMENT 'Action performed (e.g., graded, loggedin)',
  `target` varchar(100) DEFAULT NULL COMMENT 'Target of action',
  `objectid` bigint(20) DEFAULT NULL COMMENT 'Object ID',
  `log_id` bigint(20) NOT NULL COMMENT 'Moodle log ID (for duplicate prevention)',
  `activity_timestamp` bigint(20) DEFAULT NULL COMMENT 'Activity timestamp (Unix)',
  `extraction_date` date NOT NULL COMMENT 'Date when data was extracted',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_log_id` (`log_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_course_id` (`course_id`),
  KEY `idx_log_id` (`log_id`),
  KEY `idx_extraction_date` (`extraction_date`),
  KEY `idx_activity_date` (`activity_date`),
  KEY `idx_component` (`component`),
  KEY `idx_action` (`action`),
  KEY `idx_username` (`username`),
  KEY `idx_activity_timestamp` (`activity_timestamp`),
  KEY `idx_user_date` (`user_id`,`extraction_date`),
  KEY `idx_course_date` (`course_id`,`extraction_date`)
) ENGINE=InnoDB AUTO_INCREMENT=3389 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;