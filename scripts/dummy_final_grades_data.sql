-- Dummy data untuk final grades courseId=3
-- Menambahkan data di monev_cp_activity_summary untuk courseId=3

INSERT INTO monev_cp_activity_summary (course_id, section, activity_id, activity_type, activity_name, accessed_count, submission_count, graded_count, attempted_count, created_at, updated_at) VALUES
(3, 1, 1, 'assign', 'Tugas Pertama Course 3', 5, 3, 3, 5, NOW(), NOW()),
(3, 1, 2, 'assign', 'Tugas Kedua Course 3', 4, 2, 2, 4, NOW(), NOW()),
(3, 1, 3, 'quiz', 'Quiz Pertama Course 3', 6, 4, 4, 6, NOW(), NOW()),
(3, 1, 4, 'quiz', 'Quiz Kedua Course 3', 5, 3, 3, 5, NOW(), NOW());

-- Menambahkan data di monev_cp_student_assignment_detail untuk courseId=3
INSERT INTO monev_cp_student_assignment_detail (assignment_id, user_id, nim, full_name, waktu_pengerjaan, nilai, created_at) VALUES
(1, 2, '2021001', 'Student A', NULL, 85.00, NOW()),
(1, 3, '2021002', 'Student B', NULL, 92.00, NOW()),
(1, 4, '2021003', 'Student C', NULL, 78.00, NOW()),
(2, 2, '2021001', 'Student A', NULL, 88.00, NOW()),
(2, 3, '2021002', 'Student B', NULL, 95.00, NOW());

-- Menambahkan data di monev_cp_student_quiz_detail untuk courseId=3
INSERT INTO monev_cp_student_quiz_detail (quiz_id, user_id, nim, full_name, waktu_mulai, waktu_selesai, durasi_waktu, jumlah_soal, jumlah_dikerjakan, nilai, created_at) VALUES
(3, 2, '2021001', 'Student A', NOW(), NOW(), '00:30:00', 10, 10, 90.00, NOW()),
(3, 3, '2021002', 'Student B', NOW(), NOW(), '00:25:00', 10, 10, 87.00, NOW()),
(3, 4, '2021003', 'Student C', NOW(), NOW(), '00:35:00', 10, 10, 82.00, NOW()),
(4, 2, '2021001', 'Student A', NOW(), NOW(), '00:28:00', 10, 10, 85.00, NOW()),
(4, 3, '2021002', 'Student B', NOW(), NOW(), '00:32:00', 10, 10, 93.00, NOW());
