-- Dummy data lengkap untuk final grades semua course
-- Menghapus data yang sudah ada untuk menghindari duplikasi
DELETE FROM monev_cp_student_assignment_detail WHERE assignment_id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
DELETE FROM monev_cp_student_quiz_detail WHERE quiz_id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
DELETE FROM monev_cp_activity_summary WHERE course_id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

-- Menambahkan aktivitas untuk semua course (1-10)
INSERT INTO monev_cp_activity_summary (course_id, section, activity_id, activity_type, activity_name, accessed_count, submission_count, graded_count, attempted_count, created_at, updated_at) VALUES
-- Course 1: KETERAMPILAN PRESENTASI BERBAHASA INGGRIS
(1, 1, 101, 'assign', 'Tugas Presentasi 1', 15, 12, 12, 15, NOW(), NOW()),
(1, 1, 102, 'assign', 'Tugas Presentasi 2', 15, 10, 10, 15, NOW(), NOW()),
(1, 1, 103, 'quiz', 'Quiz Presentasi 1', 15, 15, 15, 15, NOW(), NOW()),
(1, 1, 104, 'quiz', 'Quiz Presentasi 2', 15, 13, 13, 15, NOW(), NOW()),

-- Course 2: AGAMA KATOLIK
(2, 1, 201, 'assign', 'Tugas Agama 1', 20, 18, 18, 20, NOW(), NOW()),
(2, 1, 202, 'assign', 'Tugas Agama 2', 20, 16, 16, 20, NOW(), NOW()),
(2, 1, 203, 'quiz', 'Quiz Agama 1', 20, 20, 20, 20, NOW(), NOW()),
(2, 1, 204, 'quiz', 'Quiz Agama 2', 20, 19, 19, 20, NOW(), NOW()),

-- Course 3: AGAMA KONG HU CU
(3, 1, 301, 'assign', 'Tugas Kong Hu Cu 1', 12, 10, 10, 12, NOW(), NOW()),
(3, 1, 302, 'assign', 'Tugas Kong Hu Cu 2', 12, 9, 9, 12, NOW(), NOW()),
(3, 1, 303, 'quiz', 'Quiz Kong Hu Cu 1', 12, 12, 12, 12, NOW(), NOW()),
(3, 1, 304, 'quiz', 'Quiz Kong Hu Cu 2', 12, 11, 11, 12, NOW(), NOW()),

-- Course 4: KETERAMPILAN PRESENTASI BERBAHASA INGGRIS LANJUTAN
(4, 1, 401, 'assign', 'Tugas Presentasi Lanjutan 1', 18, 15, 15, 18, NOW(), NOW()),
(4, 1, 402, 'assign', 'Tugas Presentasi Lanjutan 2', 18, 14, 14, 18, NOW(), NOW()),
(4, 1, 403, 'quiz', 'Quiz Presentasi Lanjutan 1', 18, 18, 18, 18, NOW(), NOW()),
(4, 1, 404, 'quiz', 'Quiz Presentasi Lanjutan 2', 18, 16, 16, 18, NOW(), NOW()),

-- Course 5: AGAMA KATOLIK LANJUTAN
(5, 1, 501, 'assign', 'Tugas Agama Lanjutan 1', 16, 14, 14, 16, NOW(), NOW()),
(5, 1, 502, 'assign', 'Tugas Agama Lanjutan 2', 16, 13, 13, 16, NOW(), NOW()),
(5, 1, 503, 'quiz', 'Quiz Agama Lanjutan 1', 16, 16, 16, 16, NOW(), NOW()),
(5, 1, 504, 'quiz', 'Quiz Agama Lanjutan 2', 16, 15, 15, 16, NOW(), NOW()),

-- Course 6: AGAMA KONG HU CU LANJUTAN
(6, 1, 601, 'assign', 'Tugas Kong Hu Cu Lanjutan 1', 14, 12, 12, 14, NOW(), NOW()),
(6, 1, 602, 'assign', 'Tugas Kong Hu Cu Lanjutan 2', 14, 11, 11, 14, NOW(), NOW()),
(6, 1, 603, 'quiz', 'Quiz Kong Hu Cu Lanjutan 1', 14, 14, 14, 14, NOW(), NOW()),
(6, 1, 604, 'quiz', 'Quiz Kong Hu Cu Lanjutan 2', 14, 13, 13, 14, NOW(), NOW()),

-- Course 7: KETERAMPILAN PRESENTASI BERBAHASA INGGRIS MAHIR
(7, 1, 701, 'assign', 'Tugas Presentasi Mahir 1', 20, 17, 17, 20, NOW(), NOW()),
(7, 1, 702, 'assign', 'Tugas Presentasi Mahir 2', 20, 16, 16, 20, NOW(), NOW()),
(7, 1, 703, 'quiz', 'Quiz Presentasi Mahir 1', 20, 20, 20, 20, NOW(), NOW()),
(7, 1, 704, 'quiz', 'Quiz Presentasi Mahir 2', 20, 18, 18, 20, NOW(), NOW()),

-- Course 8: AGAMA KATOLIK MAHIR
(8, 1, 801, 'assign', 'Tugas Agama Mahir 1', 22, 19, 19, 22, NOW(), NOW()),
(8, 1, 802, 'assign', 'Tugas Agama Mahir 2', 22, 18, 18, 22, NOW(), NOW()),
(8, 1, 803, 'quiz', 'Quiz Agama Mahir 1', 22, 22, 22, 22, NOW(), NOW()),
(8, 1, 804, 'quiz', 'Quiz Agama Mahir 2', 22, 20, 20, 22, NOW(), NOW()),

-- Course 9: AGAMA KONG HU CU MAHIR
(9, 1, 901, 'assign', 'Tugas Kong Hu Cu Mahir 1', 18, 15, 15, 18, NOW(), NOW()),
(9, 1, 902, 'assign', 'Tugas Kong Hu Cu Mahir 2', 18, 14, 14, 18, NOW(), NOW()),
(9, 1, 903, 'quiz', 'Quiz Kong Hu Cu Mahir 1', 18, 18, 18, 18, NOW(), NOW()),
(9, 1, 904, 'quiz', 'Quiz Kong Hu Cu Mahir 2', 18, 16, 16, 18, NOW(), NOW()),

-- Course 10: KETERAMPILAN PRESENTASI BERBAHASA INGGRIS EXPERT
(10, 1, 1001, 'assign', 'Tugas Presentasi Expert 1', 25, 21, 21, 25, NOW(), NOW()),
(10, 1, 1002, 'assign', 'Tugas Presentasi Expert 2', 25, 20, 20, 25, NOW(), NOW()),
(10, 1, 1003, 'quiz', 'Quiz Presentasi Expert 1', 25, 25, 25, 25, NOW(), NOW()),
(10, 1, 1004, 'quiz', 'Quiz Presentasi Expert 2', 25, 23, 23, 25, NOW(), NOW());

-- Menambahkan data assignment dengan nilai bervariasi
INSERT INTO monev_cp_student_assignment_detail (assignment_id, user_id, nim, full_name, waktu_pengerjaan, nilai, created_at) VALUES
-- Course 1 Assignments
(101, 1, '2021001', 'Student A1', NULL, 85.00, NOW()),
(101, 2, '2021002', 'Student B1', NULL, 92.00, NOW()),
(101, 3, '2021003', 'Student C1', NULL, 78.00, NOW()),
(101, 4, '2021004', 'Student D1', NULL, 88.00, NOW()),
(101, 5, '2021005', 'Student E1', NULL, 95.00, NOW()),
(102, 1, '2021001', 'Student A1', NULL, 82.00, NOW()),
(102, 2, '2021002', 'Student B1', NULL, 89.00, NOW()),
(102, 3, '2021003', 'Student C1', NULL, 75.00, NOW()),
(102, 4, '2021004', 'Student D1', NULL, 91.00, NOW()),
(102, 5, '2021005', 'Student E1', NULL, 87.00, NOW()),

-- Course 2 Assignments
(201, 6, '2021006', 'Student F2', NULL, 90.00, NOW()),
(201, 7, '2021007', 'Student G2', NULL, 85.00, NOW()),
(201, 8, '2021008', 'Student H2', NULL, 93.00, NOW()),
(201, 9, '2021009', 'Student I2', NULL, 79.00, NOW()),
(201, 10, '2021010', 'Student J2', NULL, 88.00, NOW()),
(202, 6, '2021006', 'Student F2', NULL, 87.00, NOW()),
(202, 7, '2021007', 'Student G2', NULL, 92.00, NOW()),
(202, 8, '2021008', 'Student H2', NULL, 84.00, NOW()),
(202, 9, '2021009', 'Student I2', NULL, 91.00, NOW()),
(202, 10, '2021010', 'Student J2', NULL, 86.00, NOW()),

-- Course 3 Assignments
(301, 11, '2021011', 'Student K3', NULL, 83.00, NOW()),
(301, 12, '2021012', 'Student L3', NULL, 89.00, NOW()),
(301, 13, '2021013', 'Student M3', NULL, 76.00, NOW()),
(301, 14, '2021014', 'Student N3', NULL, 94.00, NOW()),
(301, 15, '2021015', 'Student O3', NULL, 81.00, NOW()),
(302, 11, '2021011', 'Student K3', NULL, 88.00, NOW()),
(302, 12, '2021012', 'Student L3', NULL, 85.00, NOW()),
(302, 13, '2021013', 'Student M3', NULL, 90.00, NOW()),
(302, 14, '2021014', 'Student N3', NULL, 82.00, NOW()),
(302, 15, '2021015', 'Student O3', NULL, 87.00, NOW()),

-- Course 4 Assignments
(401, 16, '2021016', 'Student P4', NULL, 91.00, NOW()),
(401, 17, '2021017', 'Student Q4', NULL, 86.00, NOW()),
(401, 18, '2021018', 'Student R4', NULL, 93.00, NOW()),
(401, 19, '2021019', 'Student S4', NULL, 84.00, NOW()),
(401, 20, '2021020', 'Student T4', NULL, 89.00, NOW()),
(402, 16, '2021016', 'Student P4', NULL, 88.00, NOW()),
(402, 17, '2021017', 'Student Q4', NULL, 92.00, NOW()),
(402, 18, '2021018', 'Student R4', NULL, 85.00, NOW()),
(402, 19, '2021019', 'Student S4', NULL, 90.00, NOW()),
(402, 20, '2021020', 'Student T4', NULL, 87.00, NOW()),

-- Course 5 Assignments
(501, 21, '2021021', 'Student U5', NULL, 87.00, NOW()),
(501, 22, '2021022', 'Student V5', NULL, 93.00, NOW()),
(501, 23, '2021023', 'Student W5', NULL, 81.00, NOW()),
(501, 24, '2021024', 'Student X5', NULL, 89.00, NOW()),
(501, 25, '2021025', 'Student Y5', NULL, 85.00, NOW()),
(502, 21, '2021021', 'Student U5', NULL, 90.00, NOW()),
(502, 22, '2021022', 'Student V5', NULL, 86.00, NOW()),
(502, 23, '2021023', 'Student W5', NULL, 92.00, NOW()),
(502, 24, '2021024', 'Student X5', NULL, 83.00, NOW()),
(502, 25, '2021025', 'Student Y5', NULL, 88.00, NOW()),

-- Course 6 Assignments
(601, 26, '2021026', 'Student Z6', NULL, 84.00, NOW()),
(601, 27, '2021027', 'Student AA6', NULL, 91.00, NOW()),
(601, 28, '2021028', 'Student BB6', NULL, 78.00, NOW()),
(601, 29, '2021029', 'Student CC6', NULL, 87.00, NOW()),
(601, 30, '2021030', 'Student DD6', NULL, 93.00, NOW()),
(602, 26, '2021026', 'Student Z6', NULL, 89.00, NOW()),
(602, 27, '2021027', 'Student AA6', NULL, 85.00, NOW()),
(602, 28, '2021028', 'Student BB6', NULL, 90.00, NOW()),
(602, 29, '2021029', 'Student CC6', NULL, 82.00, NOW()),
(602, 30, '2021030', 'Student DD6', NULL, 86.00, NOW()),

-- Course 7 Assignments
(701, 31, '2021031', 'Student EE7', NULL, 92.00, NOW()),
(701, 32, '2021032', 'Student FF7', NULL, 88.00, NOW()),
(701, 33, '2021033', 'Student GG7', NULL, 94.00, NOW()),
(701, 34, '2021034', 'Student HH7', NULL, 86.00, NOW()),
(701, 35, '2021035', 'Student II7', NULL, 91.00, NOW()),
(702, 31, '2021031', 'Student EE7', NULL, 89.00, NOW()),
(702, 32, '2021032', 'Student FF7', NULL, 93.00, NOW()),
(702, 33, '2021033', 'Student GG7', NULL, 87.00, NOW()),
(702, 34, '2021034', 'Student HH7', NULL, 90.00, NOW()),
(702, 35, '2021035', 'Student II7', NULL, 85.00, NOW()),

-- Course 8 Assignments
(801, 36, '2021036', 'Student JJ8', NULL, 91.00, NOW()),
(801, 37, '2021037', 'Student KK8', NULL, 87.00, NOW()),
(801, 38, '2021038', 'Student LL8', NULL, 94.00, NOW()),
(801, 39, '2021039', 'Student MM8', NULL, 89.00, NOW()),
(801, 40, '2021040', 'Student NN8', NULL, 92.00, NOW()),
(802, 36, '2021036', 'Student JJ8', NULL, 88.00, NOW()),
(802, 37, '2021037', 'Student KK8', NULL, 93.00, NOW()),
(802, 38, '2021038', 'Student LL8', NULL, 86.00, NOW()),
(802, 39, '2021039', 'Student MM8', NULL, 90.00, NOW()),
(802, 40, '2021040', 'Student NN8', NULL, 85.00, NOW()),

-- Course 9 Assignments
(901, 41, '2021041', 'Student OO9', NULL, 90.00, NOW()),
(901, 42, '2021042', 'Student PP9', NULL, 86.00, NOW()),
(901, 43, '2021043', 'Student QQ9', NULL, 93.00, NOW()),
(901, 44, '2021044', 'Student RR9', NULL, 88.00, NOW()),
(901, 45, '2021045', 'Student SS9', NULL, 91.00, NOW()),
(902, 41, '2021041', 'Student OO9', NULL, 87.00, NOW()),
(902, 42, '2021042', 'Student PP9', NULL, 92.00, NOW()),
(902, 43, '2021043', 'Student QQ9', NULL, 85.00, NOW()),
(902, 44, '2021044', 'Student RR9', NULL, 89.00, NOW()),
(902, 45, '2021045', 'Student SS9', NULL, 84.00, NOW()),

-- Course 10 Assignments
(1001, 46, '2021046', 'Student TT10', NULL, 94.00, NOW()),
(1001, 47, '2021047', 'Student UU10', NULL, 90.00, NOW()),
(1001, 48, '2021048', 'Student VV10', NULL, 96.00, NOW()),
(1001, 49, '2021049', 'Student WW10', NULL, 88.00, NOW()),
(1001, 50, '2021050', 'Student XX10', NULL, 92.00, NOW()),
(1002, 46, '2021046', 'Student TT10', NULL, 91.00, NOW()),
(1002, 47, '2021047', 'Student UU10', NULL, 95.00, NOW()),
(1002, 48, '2021048', 'Student VV10', NULL, 89.00, NOW()),
(1002, 49, '2021049', 'Student WW10', NULL, 93.00, NOW()),
(1002, 50, '2021050', 'Student XX10', NULL, 87.00, NOW());

-- Menambahkan data quiz dengan nilai bervariasi
INSERT INTO monev_cp_student_quiz_detail (quiz_id, user_id, nim, full_name, waktu_mulai, waktu_selesai, durasi_waktu, jumlah_soal, jumlah_dikerjakan, nilai, created_at) VALUES
-- Course 1 Quizzes
(103, 1, '2021001', 'Student A1', NOW(), NOW(), '00:30:00', 10, 10, 88.00, NOW()),
(103, 2, '2021002', 'Student B1', NOW(), NOW(), '00:25:00', 10, 10, 92.00, NOW()),
(103, 3, '2021003', 'Student C1', NOW(), NOW(), '00:35:00', 10, 10, 85.00, NOW()),
(103, 4, '2021004', 'Student D1', NOW(), NOW(), '00:28:00', 10, 10, 90.00, NOW()),
(103, 5, '2021005', 'Student E1', NOW(), NOW(), '00:32:00', 10, 10, 87.00, NOW()),
(104, 1, '2021001', 'Student A1', NOW(), NOW(), '00:29:00', 10, 10, 91.00, NOW()),
(104, 2, '2021002', 'Student B1', NOW(), NOW(), '00:26:00', 10, 10, 86.00, NOW()),
(104, 3, '2021003', 'Student C1', NOW(), NOW(), '00:33:00', 10, 10, 93.00, NOW()),
(104, 4, '2021004', 'Student D1', NOW(), NOW(), '00:27:00', 10, 10, 89.00, NOW()),
(104, 5, '2021005', 'Student E1', NOW(), NOW(), '00:31:00', 10, 10, 84.00, NOW()),

-- Course 2 Quizzes
(203, 6, '2021006', 'Student F2', NOW(), NOW(), '00:30:00', 10, 10, 89.00, NOW()),
(203, 7, '2021007', 'Student G2', NOW(), NOW(), '00:25:00', 10, 10, 93.00, NOW()),
(203, 8, '2021008', 'Student H2', NOW(), NOW(), '00:35:00', 10, 10, 86.00, NOW()),
(203, 9, '2021009', 'Student I2', NOW(), NOW(), '00:28:00', 10, 10, 91.00, NOW()),
(203, 10, '2021010', 'Student J2', NOW(), NOW(), '00:32:00', 10, 10, 88.00, NOW()),
(204, 6, '2021006', 'Student F2', NOW(), NOW(), '00:29:00', 10, 10, 92.00, NOW()),
(204, 7, '2021007', 'Student G2', NOW(), NOW(), '00:26:00', 10, 10, 87.00, NOW()),
(204, 8, '2021008', 'Student H2', NOW(), NOW(), '00:33:00', 10, 10, 94.00, NOW()),
(204, 9, '2021009', 'Student I2', NOW(), NOW(), '00:27:00', 10, 10, 90.00, NOW()),
(204, 10, '2021010', 'Student J2', NOW(), NOW(), '00:31:00', 10, 10, 85.00, NOW()),

-- Course 3 Quizzes
(303, 11, '2021011', 'Student K3', NOW(), NOW(), '00:30:00', 10, 10, 87.00, NOW()),
(303, 12, '2021012', 'Student L3', NOW(), NOW(), '00:25:00', 10, 10, 91.00, NOW()),
(303, 13, '2021013', 'Student M3', NOW(), NOW(), '00:35:00', 10, 10, 84.00, NOW()),
(303, 14, '2021014', 'Student N3', NOW(), NOW(), '00:28:00', 10, 10, 89.00, NOW()),
(303, 15, '2021015', 'Student O3', NOW(), NOW(), '00:32:00', 10, 10, 93.00, NOW()),
(304, 11, '2021011', 'Student K3', NOW(), NOW(), '00:29:00', 10, 10, 90.00, NOW()),
(304, 12, '2021012', 'Student L3', NOW(), NOW(), '00:26:00', 10, 10, 86.00, NOW()),
(304, 13, '2021013', 'Student M3', NOW(), NOW(), '00:33:00', 10, 10, 92.00, NOW()),
(304, 14, '2021014', 'Student N3', NOW(), NOW(), '00:27:00', 10, 10, 88.00, NOW()),
(304, 15, '2021015', 'Student O3', NOW(), NOW(), '00:31:00', 10, 10, 85.00, NOW()),

-- Course 4 Quizzes
(403, 16, '2021016', 'Student P4', NOW(), NOW(), '00:30:00', 10, 10, 90.00, NOW()),
(403, 17, '2021017', 'Student Q4', NOW(), NOW(), '00:25:00', 10, 10, 94.00, NOW()),
(403, 18, '2021018', 'Student R4', NOW(), NOW(), '00:35:00', 10, 10, 87.00, NOW()),
(403, 19, '2021019', 'Student S4', NOW(), NOW(), '00:28:00', 10, 10, 92.00, NOW()),
(403, 20, '2021020', 'Student T4', NOW(), NOW(), '00:32:00', 10, 10, 89.00, NOW()),
(404, 16, '2021016', 'Student P4', NOW(), NOW(), '00:29:00', 10, 10, 93.00, NOW()),
(404, 17, '2021017', 'Student Q4', NOW(), NOW(), '00:26:00', 10, 10, 88.00, NOW()),
(404, 18, '2021018', 'Student R4', NOW(), NOW(), '00:33:00', 10, 10, 95.00, NOW()),
(404, 19, '2021019', 'Student S4', NOW(), NOW(), '00:27:00', 10, 10, 91.00, NOW()),
(404, 20, '2021020', 'Student T4', NOW(), NOW(), '00:31:00', 10, 10, 86.00, NOW()),

-- Course 5 Quizzes
(503, 21, '2021021', 'Student U5', NOW(), NOW(), '00:30:00', 10, 10, 88.00, NOW()),
(503, 22, '2021022', 'Student V5', NOW(), NOW(), '00:25:00', 10, 10, 92.00, NOW()),
(503, 23, '2021023', 'Student W5', NOW(), NOW(), '00:35:00', 10, 10, 85.00, NOW()),
(503, 24, '2021024', 'Student X5', NOW(), NOW(), '00:28:00', 10, 10, 90.00, NOW()),
(503, 25, '2021025', 'Student Y5', NOW(), NOW(), '00:32:00', 10, 10, 94.00, NOW()),
(504, 21, '2021021', 'Student U5', NOW(), NOW(), '00:29:00', 10, 10, 91.00, NOW()),
(504, 22, '2021022', 'Student V5', NOW(), NOW(), '00:26:00', 10, 10, 87.00, NOW()),
(504, 23, '2021023', 'Student W5', NOW(), NOW(), '00:33:00', 10, 10, 93.00, NOW()),
(504, 24, '2021024', 'Student X5', NOW(), NOW(), '00:27:00', 10, 10, 89.00, NOW()),
(504, 25, '2021025', 'Student Y5', NOW(), NOW(), '00:31:00', 10, 10, 86.00, NOW()),

-- Course 6 Quizzes
(603, 26, '2021026', 'Student Z6', NOW(), NOW(), '00:30:00', 10, 10, 89.00, NOW()),
(603, 27, '2021027', 'Student AA6', NOW(), NOW(), '00:25:00', 10, 10, 93.00, NOW()),
(603, 28, '2021028', 'Student BB6', NOW(), NOW(), '00:35:00', 10, 10, 86.00, NOW()),
(603, 29, '2021029', 'Student CC6', NOW(), NOW(), '00:28:00', 10, 10, 91.00, NOW()),
(603, 30, '2021030', 'Student DD6', NOW(), NOW(), '00:32:00', 10, 10, 88.00, NOW()),
(604, 26, '2021026', 'Student Z6', NOW(), NOW(), '00:29:00', 10, 10, 92.00, NOW()),
(604, 27, '2021027', 'Student AA6', NOW(), NOW(), '00:26:00', 10, 10, 87.00, NOW()),
(604, 28, '2021028', 'Student BB6', NOW(), NOW(), '00:33:00', 10, 10, 94.00, NOW()),
(604, 29, '2021029', 'Student CC6', NOW(), NOW(), '00:27:00', 10, 10, 90.00, NOW()),
(604, 30, '2021030', 'Student DD6', NOW(), NOW(), '00:31:00', 10, 10, 85.00, NOW()),

-- Course 7 Quizzes
(703, 31, '2021031', 'Student EE7', NOW(), NOW(), '00:30:00', 10, 10, 91.00, NOW()),
(703, 32, '2021032', 'Student FF7', NOW(), NOW(), '00:25:00', 10, 10, 95.00, NOW()),
(703, 33, '2021033', 'Student GG7', NOW(), NOW(), '00:35:00', 10, 10, 88.00, NOW()),
(703, 34, '2021034', 'Student HH7', NOW(), NOW(), '00:28:00', 10, 10, 93.00, NOW()),
(703, 35, '2021035', 'Student II7', NOW(), NOW(), '00:32:00', 10, 10, 90.00, NOW()),
(704, 31, '2021031', 'Student EE7', NOW(), NOW(), '00:29:00', 10, 10, 94.00, NOW()),
(704, 32, '2021032', 'Student FF7', NOW(), NOW(), '00:26:00', 10, 10, 89.00, NOW()),
(704, 33, '2021033', 'Student GG7', NOW(), NOW(), '00:33:00', 10, 10, 96.00, NOW()),
(704, 34, '2021034', 'Student HH7', NOW(), NOW(), '00:27:00', 10, 10, 92.00, NOW()),
(704, 35, '2021035', 'Student II7', NOW(), NOW(), '00:31:00', 10, 10, 87.00, NOW()),

-- Course 8 Quizzes
(803, 36, '2021036', 'Student JJ8', NOW(), NOW(), '00:30:00', 10, 10, 92.00, NOW()),
(803, 37, '2021037', 'Student KK8', NOW(), NOW(), '00:25:00', 10, 10, 96.00, NOW()),
(803, 38, '2021038', 'Student LL8', NOW(), NOW(), '00:35:00', 10, 10, 89.00, NOW()),
(803, 39, '2021039', 'Student MM8', NOW(), NOW(), '00:28:00', 10, 10, 94.00, NOW()),
(803, 40, '2021040', 'Student NN8', NOW(), NOW(), '00:32:00', 10, 10, 91.00, NOW()),
(804, 36, '2021036', 'Student JJ8', NOW(), NOW(), '00:29:00', 10, 10, 95.00, NOW()),
(804, 37, '2021037', 'Student KK8', NOW(), NOW(), '00:26:00', 10, 10, 90.00, NOW()),
(804, 38, '2021038', 'Student LL8', NOW(), NOW(), '00:33:00', 10, 10, 97.00, NOW()),
(804, 39, '2021039', 'Student MM8', NOW(), NOW(), '00:27:00', 10, 10, 93.00, NOW()),
(804, 40, '2021040', 'Student NN8', NOW(), NOW(), '00:31:00', 10, 10, 88.00, NOW()),

-- Course 9 Quizzes
(903, 41, '2021041', 'Student OO9', NOW(), NOW(), '00:30:00', 10, 10, 91.00, NOW()),
(903, 42, '2021042', 'Student PP9', NOW(), NOW(), '00:25:00', 10, 10, 95.00, NOW()),
(903, 43, '2021043', 'Student QQ9', NOW(), NOW(), '00:35:00', 10, 10, 88.00, NOW()),
(903, 44, '2021044', 'Student RR9', NOW(), NOW(), '00:28:00', 10, 10, 93.00, NOW()),
(903, 45, '2021045', 'Student SS9', NOW(), NOW(), '00:32:00', 10, 10, 90.00, NOW()),
(904, 41, '2021041', 'Student OO9', NOW(), NOW(), '00:29:00', 10, 10, 94.00, NOW()),
(904, 42, '2021042', 'Student PP9', NOW(), NOW(), '00:26:00', 10, 10, 89.00, NOW()),
(904, 43, '2021043', 'Student QQ9', NOW(), NOW(), '00:33:00', 10, 10, 96.00, NOW()),
(904, 44, '2021044', 'Student RR9', NOW(), NOW(), '00:27:00', 10, 10, 92.00, NOW()),
(904, 45, '2021045', 'Student SS9', NOW(), NOW(), '00:31:00', 10, 10, 87.00, NOW()),

-- Course 10 Quizzes
(1003, 46, '2021046', 'Student TT10', NOW(), NOW(), '00:30:00', 10, 10, 94.00, NOW()),
(1003, 47, '2021047', 'Student UU10', NOW(), NOW(), '00:25:00', 10, 10, 98.00, NOW()),
(1003, 48, '2021048', 'Student VV10', NOW(), NOW(), '00:35:00', 10, 10, 91.00, NOW()),
(1003, 49, '2021049', 'Student WW10', NOW(), NOW(), '00:28:00', 10, 10, 96.00, NOW()),
(1003, 50, '2021050', 'Student XX10', NOW(), NOW(), '00:32:00', 10, 10, 93.00, NOW()),
(1004, 46, '2021046', 'Student TT10', NOW(), NOW(), '00:29:00', 10, 10, 97.00, NOW()),
(1004, 47, '2021047', 'Student UU10', NOW(), NOW(), '00:26:00', 10, 10, 92.00, NOW()),
(1004, 48, '2021048', 'Student VV10', NOW(), NOW(), '00:33:00', 10, 10, 99.00, NOW()),
(1004, 49, '2021049', 'Student WW10', NOW(), NOW(), '00:27:00', 10, 10, 95.00, NOW()),
(1004, 50, '2021050', 'Student XX10', NOW(), NOW(), '00:31:00', 10, 10, 90.00, NOW());
