-- ETL Tables Creation Script
-- Run this script to create the necessary tables for the ETL process in the moodle_logs database

-- Make sure you're using the correct database
USE moodle_logs;

-- 1. raw_log table
CREATE TABLE IF NOT EXISTS raw_log (
    id INT PRIMARY KEY,
    eventname VARCHAR(255),
    component VARCHAR(100),
    action VARCHAR(100),
    target VARCHAR(100),
    objecttable VARCHAR(50),
    objectid INT,
    crud CHAR(1),
    edulevel INT,
    contextid INT,
    contextlevel INT,
    contextinstanceid INT,
    userid INT,
    courseid INT,
    relateduserid INT,
    anonymous TINYINT,
    other LONGTEXT,
    timecreated INT,
    origin VARCHAR(10),
    ip VARCHAR(45),
    realuserid INT,
    INDEX idx_raw_log_eventname (eventname),
    INDEX idx_raw_log_component (component),
    INDEX idx_raw_log_action (action),
    INDEX idx_raw_log_userid (userid),
    INDEX idx_raw_log_courseid (courseid),
    INDEX idx_raw_log_timecreated (timecreated)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. course_activity_summary table
CREATE TABLE IF NOT EXISTS course_activity_summary (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    section INT,
    activity_id INT,
    activity_type VARCHAR(50),
    activity_name VARCHAR(255),
    accessed_count INT DEFAULT 0,
    submission_count INT DEFAULT 0,
    graded_count INT DEFAULT 0,
    attempted_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_course_activity_course (course_id),
    INDEX idx_course_activity_type (activity_type),
    INDEX idx_course_activity_section (section)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. student_profile table
CREATE TABLE IF NOT EXISTS student_profile (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    idnumber VARCHAR(100),
    full_name VARCHAR(255),
    email VARCHAR(255),
    program_studi VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_student_profile_idnumber (idnumber),
    INDEX idx_student_profile_email (email),
    INDEX idx_student_profile_program (program_studi)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. student_quiz_detail table
CREATE TABLE IF NOT EXISTS student_quiz_detail (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id INT NOT NULL,
    user_id INT NOT NULL,
    nim VARCHAR(100),
    full_name VARCHAR(255),
    waktu_mulai DATETIME,
    waktu_selesai DATETIME,
    durasi_waktu TIME,
    jumlah_soal INT DEFAULT 0,
    jumlah_dikerjakan INT DEFAULT 0,
    nilai DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_quiz_detail_quiz (quiz_id),
    INDEX idx_quiz_detail_user (user_id),
    INDEX idx_quiz_detail_nim (nim),
    INDEX idx_quiz_detail_waktu (waktu_mulai, waktu_selesai)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. student_assignment_detail table
CREATE TABLE IF NOT EXISTS student_assignment_detail (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT NOT NULL,
    user_id INT NOT NULL,
    nim VARCHAR(100),
    full_name VARCHAR(255),
    waktu_submit DATETIME,
    waktu_pengerjaan TIME,
    nilai DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_assignment_detail_assignment (assignment_id),
    INDEX idx_assignment_detail_user (user_id),
    INDEX idx_assignment_detail_nim (nim),
    INDEX idx_assignment_detail_submit (waktu_submit)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. student_resource_access table
CREATE TABLE IF NOT EXISTS student_resource_access (
    id INT AUTO_INCREMENT PRIMARY KEY,
    resource_id INT NOT NULL,
    user_id INT NOT NULL,
    nim VARCHAR(100),
    full_name VARCHAR(255),
    waktu_akses DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_resource_access_resource (resource_id),
    INDEX idx_resource_access_user (user_id),
    INDEX idx_resource_access_nim (nim),
    INDEX idx_resource_access_waktu (waktu_akses)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. course_summary table
CREATE TABLE IF NOT EXISTS course_summary (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL UNIQUE,
    course_name VARCHAR(255),
    kelas VARCHAR(255),
    jumlah_aktivitas INT DEFAULT 0,
    jumlah_mahasiswa INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_course_summary_course (course_id),
    INDEX idx_course_summary_kelas (kelas)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; 