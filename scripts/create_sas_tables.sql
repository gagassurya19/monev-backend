-- Create SAS (Student Activity Summary) tables
-- This script creates the necessary tables for SAS ETL data

-- Create monev_sas_courses table
CREATE TABLE IF NOT EXISTS `monev_sas_courses` (
  `course_id` int(11) NOT NULL,
  `subject_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `course_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `course_shortname` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `faculty_id` int(11) DEFAULT NULL,
  `program_id` int(11) DEFAULT NULL,
  `visible` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`course_id`),
  UNIQUE KEY `uk_subject_id` (`subject_id`),
  KEY `idx_program_id` (`program_id`),
  KEY `idx_faculty_id` (`faculty_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create monev_sas_activity_counts_etl table
CREATE TABLE IF NOT EXISTS `monev_sas_activity_counts_etl` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `courseid` int(11) NOT NULL,
  `file_views` int(11) DEFAULT '0',
  `video_views` int(11) DEFAULT '0',
  `forum_views` int(11) DEFAULT '0',
  `quiz_views` int(11) DEFAULT '0',
  `assignment_views` int(11) DEFAULT '0',
  `url_views` int(11) DEFAULT '0',
  `active_days` int(11) DEFAULT '0',
  `extraction_date` date NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_courseid` (`courseid`),
  KEY `idx_extraction_date` (`extraction_date`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create monev_sas_user_activity_etl table
CREATE TABLE IF NOT EXISTS `monev_sas_user_activity_etl` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `course_id` int(11) NOT NULL,
  `num_teachers` int(11) DEFAULT '0',
  `num_students` int(11) DEFAULT '0',
  `file_views` int(11) DEFAULT '0',
  `video_views` int(11) DEFAULT '0',
  `forum_views` int(11) DEFAULT '0',
  `quiz_views` int(11) DEFAULT '0',
  `assignment_views` int(11) DEFAULT '0',
  `url_views` int(11) DEFAULT '0',
  `total_views` int(11) DEFAULT '0',
  `avg_activity_per_student_per_day` decimal(10,2) DEFAULT NULL,
  `active_days` int(11) DEFAULT '0',
  `extraction_date` date NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_unique_course_date` (`course_id`,`extraction_date`),
  KEY `idx_course_id` (`course_id`),
  KEY `idx_extraction_date` (`extraction_date`),
  CONSTRAINT `fk_monev_sas_user_activity_course` FOREIGN KEY (`course_id`) REFERENCES `monev_sas_courses` (`course_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create monev_sas_user_counts_etl table
CREATE TABLE IF NOT EXISTS `monev_sas_user_counts_etl` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `courseid` int(11) NOT NULL,
  `num_students` int(11) DEFAULT '0',
  `num_teachers` int(11) DEFAULT '0',
  `extraction_date` date NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_courseid` (`courseid`),
  KEY `idx_extraction_date` (`extraction_date`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Note: monev_sas_logs table already exists with different structure
-- The existing table structure is:
-- CREATE TABLE `monev_sas_logs` (
--   `id` bigint NOT NULL AUTO_INCREMENT,
--   `offset` int NOT NULL DEFAULT '0',
--   `status` tinyint(1) NOT NULL COMMENT '1=finished, 2=inprogress, 3=failed',
--   `start_date` datetime DEFAULT NULL,
--   `end_date` datetime DEFAULT NULL,
--   `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
--   PRIMARY KEY (`id`)
-- )

-- Insert sample data for testing (optional)
-- INSERT INTO monev_sas_courses (course_id, subject_id, course_name, course_shortname, faculty_id, program_id, visible, created_at, updated_at) 
-- VALUES (1, 'CS101', 'Introduction to Computer Science', 'CS101', 1, 1, 1, NOW(), NOW());

-- Show created tables
SHOW TABLES LIKE 'monev_sas_%';
SHOW TABLES LIKE 'monev_sas_logs';
