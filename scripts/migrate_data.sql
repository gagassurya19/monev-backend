-- Data Migration Script
-- Script ini untuk migrasi data dari database lama ke database monev_db
-- Jalankan script ini jika Anda ingin memindahkan data dari database lama

-- Pastikan Anda sudah terhubung ke database monev_db
USE monev_db;

-- Contoh migrasi data dari database lama (sesuaikan dengan struktur database lama Anda)
-- Uncomment dan sesuaikan query di bawah ini sesuai kebutuhan

/*
-- Migrasi data raw_log (jika ada)
INSERT INTO raw_log (
    id, eventname, component, action, target, objecttable, objectid,
    crud, edulevel, contextid, contextlevel, contextinstanceid,
    userid, courseid, relateduserid, anonymous, other, timecreated,
    origin, ip, realuserid
)
SELECT 
    id, eventname, component, action, target, objecttable, objectid,
    crud, edulevel, contextid, contextlevel, contextinstanceid,
    userid, courseid, relateduserid, anonymous, other, timecreated,
    origin, ip, realuserid
FROM moodle_logs.raw_log
WHERE id NOT IN (SELECT id FROM raw_log);

-- Migrasi data course_activity_summary (jika ada)
INSERT INTO course_activity_summary (
    course_id, section, activity_id, activity_type, activity_name,
    accessed_count, submission_count, graded_count, attempted_count
)
SELECT 
    course_id, section, activity_id, activity_type, activity_name,
    accessed_count, submission_count, graded_count, attempted_count
FROM moodle_logs.course_activity_summary
WHERE id NOT IN (SELECT id FROM course_activity_summary);

-- Migrasi data student_profile (jika ada)
INSERT INTO student_profile (
    user_id, idnumber, full_name, email, program_studi
)
SELECT 
    user_id, idnumber, full_name, email, program_studi
FROM moodle_logs.student_profile
WHERE user_id NOT IN (SELECT user_id FROM student_profile);

-- Migrasi data student_quiz_detail (jika ada)
INSERT INTO student_quiz_detail (
    quiz_id, user_id, nim, full_name, waktu_mulai, waktu_selesai,
    durasi_waktu, jumlah_soal, jumlah_dikerjakan, nilai
)
SELECT 
    quiz_id, user_id, nim, full_name, waktu_mulai, waktu_selesai,
    durasi_waktu, jumlah_soal, jumlah_dikerjakan, nilai
FROM moodle_logs.student_quiz_detail
WHERE id NOT IN (SELECT id FROM student_quiz_detail);

-- Migrasi data student_assignment_detail (jika ada)
INSERT INTO student_assignment_detail (
    assignment_id, user_id, nim, full_name, waktu_submit,
    waktu_pengerjaan, nilai
)
SELECT 
    assignment_id, user_id, nim, full_name, waktu_submit,
    waktu_pengerjaan, nilai
FROM moodle_logs.student_assignment_detail
WHERE id NOT IN (SELECT id FROM student_assignment_detail);

-- Migrasi data student_resource_access (jika ada)
INSERT INTO student_resource_access (
    resource_id, user_id, nim, full_name, waktu_akses
)
SELECT 
    resource_id, user_id, nim, full_name, waktu_akses
FROM moodle_logs.student_resource_access
WHERE id NOT IN (SELECT id FROM student_resource_access);

-- Migrasi data course_summary (jika ada)
INSERT INTO course_summary (
    course_id, course_name, kelas, jumlah_aktivitas, jumlah_mahasiswa
)
SELECT 
    course_id, course_name, kelas, jumlah_aktivitas, jumlah_mahasiswa
FROM moodle_logs.course_summary
WHERE course_id NOT IN (SELECT course_id FROM course_summary);
*/

-- Tampilkan statistik migrasi
SELECT 
    'raw_log' as table_name,
    COUNT(*) as record_count
FROM raw_log
UNION ALL
SELECT 
    'course_activity_summary' as table_name,
    COUNT(*) as record_count
FROM course_activity_summary
UNION ALL
SELECT 
    'student_profile' as table_name,
    COUNT(*) as record_count
FROM student_profile
UNION ALL
SELECT 
    'student_quiz_detail' as table_name,
    COUNT(*) as record_count
FROM student_quiz_detail
UNION ALL
SELECT 
    'student_assignment_detail' as table_name,
    COUNT(*) as record_count
FROM student_assignment_detail
UNION ALL
SELECT 
    'student_resource_access' as table_name,
    COUNT(*) as record_count
FROM student_resource_access
UNION ALL
SELECT 
    'course_summary' as table_name,
    COUNT(*) as record_count
FROM course_summary; 