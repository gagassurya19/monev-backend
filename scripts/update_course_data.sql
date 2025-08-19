-- Update SAS course data with correct information from CELOE API
-- This script updates the placeholder course data with the actual course information

-- Update course ID 2
UPDATE `monev_sas_courses` 
SET 
  `subject_id` = 'GBK3BAB4',
  `course_name` = 'PEMROGRAMAN UNTUK PERANGKAT BERGERAK 2',
  `course_shortname` = 'PPB',
  `faculty_id` = 2,
  `program_id` = 4
WHERE `course_id` = 2;

-- Update course ID 3
UPDATE `monev_sas_courses` 
SET 
  `subject_id` = 'GHK3JAC3',
  `course_name` = 'PROYEK MULTIMEDIA 2',
  `course_shortname` = 'PM2',
  `faculty_id` = 3,
  `program_id` = 5
WHERE `course_id` = 3;

-- Update course ID 4
UPDATE `monev_sas_courses` 
SET 
  `subject_id` = 'GHK1JAB2',
  `course_name` = 'STATISTIKA',
  `course_shortname` = 'STATISTIKA',
  `faculty_id` = 2,
  `program_id` = 6
WHERE `course_id` = 4;

-- Verify the updates
SELECT * FROM `monev_sas_courses` ORDER BY `course_id`;
