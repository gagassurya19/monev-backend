CREATE TABLE `log_scheduler` (
  `id` int NOT NULL AUTO_INCREMENT,
  `start_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `end_date` datetime DEFAULT NULL,
  `status` tinyint DEFAULT '2' COMMENT '1=finished, 2=inprogress, 3=failed',
  `numrow` int DEFAULT '0' COMMENT 'Total records processed',
  `offset` int DEFAULT '0' COMMENT 'Current offset for pagination',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_log_scheduler_status` (`status`),
  KEY `idx_log_scheduler_start_date` (`start_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `monev_cp_activity_summary` (
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

CREATE TABLE `monev_cp_course_summary` (
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

CREATE TABLE `monev_cp_fetch_logs` (
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

CREATE TABLE `monev_cp_student_assignment_detail` (
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

CREATE TABLE `monev_cp_student_profile` (
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

CREATE TABLE `monev_cp_student_quiz_detail` (
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

CREATE TABLE `monev_cp_student_resource_access` (
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

CREATE TABLE `monev_sas_activity_counts_etl` (
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

CREATE TABLE `monev_sas_categories` (
  `category_id` int NOT NULL,
  `category_name` varchar(255) NOT NULL,
  `category_site` varchar(50) DEFAULT NULL,
  `category_type` enum('FACULTY','STUDYPROGRAM','DEPARTMENT','OTHER') NOT NULL,
  `category_parent_id` int DEFAULT NULL,
  PRIMARY KEY (`category_id`),
  KEY `idx_category_type` (`category_type`),
  KEY `idx_category_parent` (`category_parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `monev_sas_courses` (
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

CREATE TABLE `monev_sas_logs` (
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

CREATE TABLE `monev_sas_realtime_logs` (
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

CREATE TABLE `monev_sas_subjects` (
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

CREATE TABLE `monev_sas_user_activity_etl` (
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

CREATE TABLE `monev_sas_user_counts_etl` (
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

CREATE TABLE `monev_users` (
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






-- setup view table
SET NAMES utf8mb4;
SET collation_connection = 'utf8mb4_unicode_ci';


DROP VIEW IF EXISTS `v_sas_course_subject_summary`;

CREATE VIEW `v_sas_course_subject_summary` AS
SELECT
  A.id AS id,
  CAST(COALESCE(A.course_name, S_all.course_name) AS CHAR) COLLATE utf8mb4_unicode_ci AS course_name,
  CAST(COALESCE(A.course_shortname, S_all.course_shortname) AS CHAR) COLLATE utf8mb4_unicode_ci AS course_shortname,
  CAST(COALESCE(A.site, S_all.site) AS CHAR) COLLATE utf8mb4_unicode_ci AS site,
  CAST(COALESCE(A.fakultas, S_all.fakultas) AS CHAR) COLLATE utf8mb4_unicode_ci AS fakultas,
  CAST(COALESCE(A.program_studi, S_all.program_studi) AS CHAR) COLLATE utf8mb4_unicode_ci AS program_studi,
  COALESCE(A.faculty_id, S_all.faculty_id) AS faculty_id,
  COALESCE(A.program_id, S_all.program_id) AS program_id,
  COALESCE(A.num_teacher, S_all.num_teacher) AS num_teacher,
  COALESCE(A.num_student, S_all.num_student) AS num_student,
  COALESCE(A.file, S_all.file) AS file,
  COALESCE(A.video, S_all.video) AS video,
  COALESCE(A.forum, S_all.forum) AS forum,
  COALESCE(A.quiz, S_all.quiz) AS quiz,
  COALESCE(A.assignment, S_all.assignment) AS assignment,
  COALESCE(A.url, S_all.url) AS url,
  COALESCE(A.sum, S_all.sum) AS sum,
  COALESCE(A.avg_activity_per_student_per_day, S_all.avg_activity_per_student_per_day) AS avg_activity_per_student_per_day
FROM (
  SELECT 
    c.course_id AS id,
    ANY_VALUE(c.course_name) COLLATE utf8mb4_unicode_ci AS course_name,
    ANY_VALUE(c.course_shortname) COLLATE utf8mb4_unicode_ci AS course_shortname,
    ANY_VALUE(COALESCE(sp.category_site, 'UNKNOWN')) COLLATE utf8mb4_unicode_ci AS site,
    ANY_VALUE(COALESCE(fc.category_name, CONCAT('FAC_', c.faculty_id))) COLLATE utf8mb4_unicode_ci AS fakultas,
    ANY_VALUE(COALESCE(sp.category_name, CONCAT('PRODI_', c.program_id))) COLLATE utf8mb4_unicode_ci AS program_studi,
    ANY_VALUE(c.faculty_id) AS faculty_id,
    ANY_VALUE(c.program_id) AS program_id,
    MAX(uae.num_teachers) AS num_teacher,
    MAX(uae.num_students) AS num_student,
    SUM(uae.file_views) AS file,
    SUM(uae.video_views) AS video,
    SUM(uae.forum_views) AS forum,
    SUM(uae.quiz_views) AS quiz,
    SUM(uae.assignment_views) AS assignment,
    SUM(uae.url_views) AS url,
    SUM(uae.file_views + uae.video_views + uae.forum_views + uae.quiz_views + uae.assignment_views + uae.url_views) AS sum,
    AVG(uae.avg_activity_per_student_per_day) AS avg_activity_per_student_per_day
  FROM monev_sas_user_activity_etl uae
  JOIN monev_sas_courses c ON c.course_id = uae.course_id
  LEFT JOIN monev_sas_categories fc ON fc.category_id = c.faculty_id AND fc.category_type = 'FACULTY'
  LEFT JOIN monev_sas_categories sp ON sp.category_id = c.program_id AND sp.category_type = 'STUDYPROGRAM'
  GROUP BY c.course_id
) A
LEFT JOIN (
  SELECT * FROM (
    SELECT
      mss.subject_id AS id,
      mss.subject_name COLLATE utf8mb4_unicode_ci AS course_name,
      mss.subject_code COLLATE utf8mb4_unicode_ci AS course_shortname,
      t.site,
      t.fakultas,
      t.program_studi,
      t.faculty_id,
      t.program_id,
      0 AS num_teacher,
      0 AS num_student,
      0 AS file,
      0 AS video,
      0 AS forum,
      0 AS quiz,
      0 AS assignment,
      0 AS url,
      0 AS sum,
      0 AS avg_activity_per_student_per_day
    FROM monev_sas_subjects mss
    LEFT JOIN (
      SELECT
        sp.category_id AS id,
        COALESCE(sp.category_site, 'UNKNOWN') COLLATE utf8mb4_unicode_ci AS site,
        COALESCE(fc.category_name, CONCAT('FAC_', sp.category_parent_id)) COLLATE utf8mb4_unicode_ci AS fakultas,
        COALESCE(sp.category_name, CONCAT('PRODI_', sp.category_id)) COLLATE utf8mb4_unicode_ci AS program_studi,
        sp.category_parent_id AS faculty_id,
        sp.category_id AS program_id
      FROM monev_sas_categories sp
      LEFT JOIN monev_sas_categories fc
        ON fc.category_id = sp.category_parent_id
       AND fc.category_type = 'FACULTY'
      WHERE sp.category_type = 'STUDYPROGRAM'
      UNION ALL
      SELECT
        fc.category_id AS id,
        CAST(NULL AS CHAR) COLLATE utf8mb4_unicode_ci AS site,
        COALESCE(fc.category_name, CONCAT('FAC_', fc.category_id)) COLLATE utf8mb4_unicode_ci AS fakultas,
        '' COLLATE utf8mb4_unicode_ci AS program_studi,
        fc.category_id AS faculty_id,
        NULL AS program_id
      FROM monev_sas_categories fc
      WHERE fc.category_type = 'FACULTY'
    ) t
      ON t.id = mss.category_id

    UNION ALL

    SELECT
      t.id AS id,
      '' COLLATE utf8mb4_unicode_ci AS course_name,
      '' COLLATE utf8mb4_unicode_ci AS course_shortname,
      t.site,
      t.fakultas,
      t.program_studi,
      t.faculty_id,
      t.program_id,
      0 AS num_teacher,
      0 AS num_student,
      0 AS file,
      0 AS video,
      0 AS forum,
      0 AS quiz,
      0 AS assignment,
      0 AS url,
      0 AS sum,
      0 AS avg_activity_per_student_per_day
    FROM (
      SELECT
        sp.category_id AS id,
        COALESCE(sp.category_site, 'UNKNOWN') COLLATE utf8mb4_unicode_ci AS site,
        COALESCE(fc.category_name, CONCAT('FAC_', sp.category_parent_id)) COLLATE utf8mb4_unicode_ci AS fakultas,
        COALESCE(sp.category_name, CONCAT('PRODI_', sp.category_id)) COLLATE utf8mb4_unicode_ci AS program_studi,
        sp.category_parent_id AS faculty_id,
        sp.category_id AS program_id
      FROM monev_sas_categories sp
      LEFT JOIN monev_sas_categories fc
        ON fc.category_id = sp.category_parent_id
       AND fc.category_type = 'FACULTY'
      WHERE sp.category_type = 'STUDYPROGRAM'
      UNION ALL
      SELECT
        fc.category_id AS id,
        CAST(NULL AS CHAR) COLLATE utf8mb4_unicode_ci AS site,
        COALESCE(fc.category_name, CONCAT('FAC_', fc.category_id)) COLLATE utf8mb4_unicode_ci AS fakultas,
        '' COLLATE utf8mb4_unicode_ci AS program_studi,
        fc.category_id AS faculty_id,
        NULL AS program_id
      FROM monev_sas_categories fc
      WHERE fc.category_type = 'FACULTY'
    ) t
    LEFT JOIN monev_sas_subjects mss
      ON mss.category_id = t.id
    WHERE mss.subject_id IS NULL
  ) S_union
) S_all
  ON A.id = S_all.id

UNION ALL

SELECT
  CASE
    WHEN S_all.course_name <> '' THEN S_all.id
    ELSE NULL
  END AS id,
  CAST(S_all.course_name AS CHAR) COLLATE utf8mb4_unicode_ci AS course_name,
  CAST(S_all.course_shortname AS CHAR) COLLATE utf8mb4_unicode_ci AS course_shortname,
  CAST(S_all.site AS CHAR) COLLATE utf8mb4_unicode_ci AS site,
  CAST(S_all.fakultas AS CHAR) COLLATE utf8mb4_unicode_ci AS fakultas,
  CAST(S_all.program_studi AS CHAR) COLLATE utf8mb4_unicode_ci AS program_studi,
  S_all.faculty_id AS faculty_id,
  S_all.program_id AS program_id,
  S_all.num_teacher AS num_teacher,
  S_all.num_student AS num_student,
  S_all.file AS file,
  S_all.video AS video,
  S_all.forum AS forum,
  S_all.quiz AS quiz,
  S_all.assignment AS assignment,
  S_all.url AS url,
  S_all.sum AS sum,
  S_all.avg_activity_per_student_per_day AS avg_activity_per_student_per_day
FROM (
  SELECT * FROM (
    SELECT
      mss.subject_id AS id,
      mss.subject_name COLLATE utf8mb4_unicode_ci AS course_name,
      mss.subject_code COLLATE utf8mb4_unicode_ci AS course_shortname,
      t.site,
      t.fakultas,
      t.program_studi,
      t.faculty_id,
      t.program_id,
      0 AS num_teacher,
      0 AS num_student,
      0 AS file,
      0 AS video,
      0 AS forum,
      0 AS quiz,
      0 AS assignment,
      0 AS url,
      0 AS sum,
      0 AS avg_activity_per_student_per_day
    FROM monev_sas_subjects mss
    LEFT JOIN (
      SELECT
        sp.category_id AS id,
        COALESCE(sp.category_site, 'UNKNOWN') COLLATE utf8mb4_unicode_ci AS site,
        COALESCE(fc.category_name, CONCAT('FAC_', sp.category_parent_id)) COLLATE utf8mb4_unicode_ci AS fakultas,
        COALESCE(sp.category_name, CONCAT('PRODI_', sp.category_id)) COLLATE utf8mb4_unicode_ci AS program_studi,
        sp.category_parent_id AS faculty_id,
        sp.category_id AS program_id
      FROM monev_sas_categories sp
      LEFT JOIN monev_sas_categories fc
        ON fc.category_id = sp.category_parent_id
       AND fc.category_type = 'FACULTY'
      WHERE sp.category_type = 'STUDYPROGRAM'
      UNION ALL
      SELECT
        fc.category_id AS id,
        CAST(NULL AS CHAR) COLLATE utf8mb4_unicode_ci AS site,
        COALESCE(fc.category_name, CONCAT('FAC_', fc.category_id)) COLLATE utf8mb4_unicode_ci AS fakultas,
        '' COLLATE utf8mb4_unicode_ci AS program_studi,
        fc.category_id AS faculty_id,
        NULL AS program_id
      FROM monev_sas_categories fc
      WHERE fc.category_type = 'FACULTY'
    ) t
      ON t.id = mss.category_id

    UNION ALL

    SELECT
      t.id AS id,
      '' COLLATE utf8mb4_unicode_ci AS course_name,
      '' COLLATE utf8mb4_unicode_ci AS course_shortname,
      t.site,
      t.fakultas,
      t.program_studi,
      t.faculty_id,
      t.program_id,
      0 AS num_teacher,
      0 AS num_student,
      0 AS file,
      0 AS video,
      0 AS forum,
      0 AS quiz,
      0 AS assignment,
      0 AS url,
      0 AS sum,
      0 AS avg_activity_per_student_per_day
    FROM (
      SELECT
        fc.category_id AS id,
        CAST(NULL AS CHAR) COLLATE utf8mb4_unicode_ci AS site,
        COALESCE(fc.category_name, CONCAT('FAC_', fc.category_id)) COLLATE utf8mb4_unicode_ci AS fakultas,
        '' COLLATE utf8mb4_unicode_ci AS program_studi,
        fc.category_id AS faculty_id,
        NULL AS program_id
      FROM monev_sas_categories fc
      WHERE fc.category_type = 'FACULTY'
    ) t
    LEFT JOIN monev_sas_subjects mss
      ON mss.category_id = t.id
    WHERE mss.subject_id IS NULL
  ) S_union
) S_all
LEFT JOIN (
  SELECT 
    c.course_id AS id,
    ANY_VALUE(c.course_name) COLLATE utf8mb4_unicode_ci AS course_name,
    ANY_VALUE(c.course_shortname) COLLATE utf8mb4_unicode_ci AS course_shortname,
    ANY_VALUE(COALESCE(sp.category_site, 'UNKNOWN')) COLLATE utf8mb4_unicode_ci AS site,
    ANY_VALUE(COALESCE(fc.category_name, CONCAT('FAC_', c.faculty_id))) COLLATE utf8mb4_unicode_ci AS fakultas,
    ANY_VALUE(COALESCE(sp.category_name, CONCAT('PRODI_', c.program_id))) COLLATE utf8mb4_unicode_ci AS program_studi,
    ANY_VALUE(c.faculty_id) AS faculty_id,
    ANY_VALUE(c.program_id) AS program_id,
    MAX(uae.num_teachers) AS num_teacher,
    MAX(uae.num_students) AS num_student,
    SUM(uae.file_views) AS file,
    SUM(uae.video_views) AS video,
    SUM(uae.forum_views) AS forum,
    SUM(uae.quiz_views) AS quiz,
    SUM(uae.assignment_views) AS assignment,
    SUM(uae.url_views) AS url,
    SUM(uae.file_views + uae.video_views + uae.forum_views + uae.quiz_views + uae.assignment_views + uae.url_views) AS sum,
    AVG(uae.avg_activity_per_student_per_day) AS avg_activity_per_student_per_day
  FROM monev_sas_user_activity_etl uae
  JOIN monev_sas_courses c ON c.course_id = uae.course_id
  LEFT JOIN monev_sas_categories fc ON fc.category_id = c.faculty_id AND fc.category_type = 'FACULTY'
  LEFT JOIN monev_sas_categories sp ON sp.category_id = c.program_id AND sp.category_type = 'STUDYPROGRAM'
  GROUP BY c.course_id
) A
  ON A.id = S_all.id
WHERE A.id IS NULL;




SHOW VARIABLES LIKE 'character_set%';
SHOW VARIABLES LIKE 'collation%';

SHOW TABLES;