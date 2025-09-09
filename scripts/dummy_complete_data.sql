-- Dummy data lengkap untuk semua kampus, fakultas, dan prodi
-- Menghapus data yang sudah ada untuk menghindari duplikasi
DELETE FROM monev_cp_student_assignment_detail WHERE assignment_id > 100;
DELETE FROM monev_cp_student_quiz_detail WHERE quiz_id > 100;
DELETE FROM monev_cp_activity_summary WHERE course_id > 10;
DELETE FROM monev_sas_courses WHERE course_id > 10;

-- Menambahkan course untuk berbagai kampus dan prodi
INSERT INTO monev_sas_courses (course_id, subject_id, course_name, course_shortname, faculty_id, program_id, visible, created_at, updated_at) VALUES
-- Kampus Bandung (bdg) - Fakultas Ekonomi dan Bisnis (305)
(11, 'FEB001', 'MANAJEMEN KEUANGAN', 'Manajemen Keuangan', 305, 334, 1, NOW(), NOW()),
(12, 'FEB002', 'PEMASARAN STRATEGIS', 'Pemasaran Strategis', 305, 334, 1, NOW(), NOW()),
(13, 'FEB003', 'AKUNTANSI DASAR', 'Akuntansi Dasar', 305, 337, 1, NOW(), NOW()),
(14, 'FEB004', 'AKUNTANSI LANJUTAN', 'Akuntansi Lanjutan', 305, 337, 1, NOW(), NOW()),
(15, 'FEB005', 'ADMINISTRASI BISNIS', 'Adm Bisnis', 305, 318, 1, NOW(), NOW()),

-- Kampus Bandung (bdg) - Fakultas Informatika (307)
(16, 'FIF001', 'PEMROGRAMAN DASAR', 'Pemrograman Dasar', 307, 315, 1, NOW(), NOW()),
(17, 'FIF002', 'STRUKTUR DATA', 'Struktur Data', 307, 315, 1, NOW(), NOW()),
(18, 'FIF003', 'ALGORITMA', 'Algoritma', 307, 315, 1, NOW(), NOW()),
(19, 'FIF004', 'BASIS DATA', 'Basis Data', 307, 315, 1, NOW(), NOW()),
(20, 'FIF005', 'PEMROGRAMAN WEB', 'Pemrograman Web', 307, 321, 1, NOW(), NOW()),

-- Kampus Bandung (bdg) - Fakultas Industri (306)
(21, 'FIT001', 'MANAJEMEN PRODUKSI', 'Manajemen Produksi', 306, 313, 1, NOW(), NOW()),
(22, 'FIT002', 'SISTEM INFORMASI', 'Sistem Informasi', 306, 314, 1, NOW(), NOW()),
(23, 'FIT003', 'PEMASARAN DIGITAL', 'Pemasaran Digital', 306, 317, 1, NOW(), NOW()),
(24, 'FIT004', 'REKAYASA PERANGKAT LUNAK', 'RPL', 306, 320, 1, NOW(), NOW()),

-- Kampus Surabaya (sby) - Fakultas Ekonomi dan Bisnis (305)
(25, 'FEB_SBY001', 'BISNIS DIGITAL', 'Bisnis Digital', 305, 1786, 1, NOW(), NOW()),
(26, 'FEB_SBY002', 'E-COMMERCE', 'E-Commerce', 305, 1786, 1, NOW(), NOW()),
(27, 'FEB_SBY003', 'DIGITAL MARKETING', 'Digital Marketing', 305, 1786, 1, NOW(), NOW()),

-- Kampus Purwokerto (pwt) - Fakultas Ekonomi dan Bisnis (305)
(28, 'FEB_PWT001', 'BISNIS DIGITAL PWT', 'Bisnis Digital PWT', 305, 1983, 1, NOW(), NOW()),
(29, 'FEB_PWT002', 'MANAJEMEN BISNIS', 'Manajemen Bisnis', 305, 1983, 1, NOW(), NOW());

-- Menambahkan aktivitas untuk course baru
INSERT INTO monev_cp_activity_summary (course_id, section, activity_id, activity_type, activity_name, accessed_count, submission_count, graded_count, attempted_count, created_at, updated_at) VALUES
-- Course 11-15 (FEB Bandung)
(11, 1, 1101, 'assign', 'Tugas Manajemen Keuangan 1', 12, 10, 10, 12, NOW(), NOW()),
(11, 1, 1102, 'quiz', 'Quiz Manajemen Keuangan 1', 12, 12, 12, 12, NOW(), NOW()),
(12, 1, 1201, 'assign', 'Tugas Pemasaran Strategis 1', 15, 13, 13, 15, NOW(), NOW()),
(12, 1, 1202, 'quiz', 'Quiz Pemasaran Strategis 1', 15, 15, 15, 15, NOW(), NOW()),
(13, 1, 1301, 'assign', 'Tugas Akuntansi Dasar 1', 18, 16, 16, 18, NOW(), NOW()),
(13, 1, 1302, 'quiz', 'Quiz Akuntansi Dasar 1', 18, 18, 18, 18, NOW(), NOW()),
(14, 1, 1401, 'assign', 'Tugas Akuntansi Lanjutan 1', 16, 14, 14, 16, NOW(), NOW()),
(14, 1, 1402, 'quiz', 'Quiz Akuntansi Lanjutan 1', 16, 16, 16, 16, NOW(), NOW()),
(15, 1, 1501, 'assign', 'Tugas Administrasi Bisnis 1', 14, 12, 12, 14, NOW(), NOW()),
(15, 1, 1502, 'quiz', 'Quiz Administrasi Bisnis 1', 14, 14, 14, 14, NOW(), NOW()),

-- Course 16-20 (FIF Bandung)
(16, 1, 1601, 'assign', 'Tugas Pemrograman Dasar 1', 20, 18, 18, 20, NOW(), NOW()),
(16, 1, 1602, 'quiz', 'Quiz Pemrograman Dasar 1', 20, 20, 20, 20, NOW(), NOW()),
(17, 1, 1701, 'assign', 'Tugas Struktur Data 1', 18, 16, 16, 18, NOW(), NOW()),
(17, 1, 1702, 'quiz', 'Quiz Struktur Data 1', 18, 18, 18, 18, NOW(), NOW()),
(18, 1, 1801, 'assign', 'Tugas Algoritma 1', 19, 17, 17, 19, NOW(), NOW()),
(18, 1, 1802, 'quiz', 'Quiz Algoritma 1', 19, 19, 19, 19, NOW(), NOW()),
(19, 1, 1901, 'assign', 'Tugas Basis Data 1', 17, 15, 15, 17, NOW(), NOW()),
(19, 1, 1902, 'quiz', 'Quiz Basis Data 1', 17, 17, 17, 17, NOW(), NOW()),
(20, 1, 2001, 'assign', 'Tugas Pemrograman Web 1', 16, 14, 14, 16, NOW(), NOW()),
(20, 1, 2002, 'quiz', 'Quiz Pemrograman Web 1', 16, 16, 16, 16, NOW(), NOW()),

-- Course 21-24 (FIT Bandung)
(21, 1, 2101, 'assign', 'Tugas Manajemen Produksi 1', 15, 13, 13, 15, NOW(), NOW()),
(21, 1, 2102, 'quiz', 'Quiz Manajemen Produksi 1', 15, 15, 15, 15, NOW(), NOW()),
(22, 1, 2201, 'assign', 'Tugas Sistem Informasi 1', 16, 14, 14, 16, NOW(), NOW()),
(22, 1, 2202, 'quiz', 'Quiz Sistem Informasi 1', 16, 16, 16, 16, NOW(), NOW()),
(23, 1, 2301, 'assign', 'Tugas Pemasaran Digital 1', 14, 12, 12, 14, NOW(), NOW()),
(23, 1, 2302, 'quiz', 'Quiz Pemasaran Digital 1', 14, 14, 14, 14, NOW(), NOW()),
(24, 1, 2401, 'assign', 'Tugas RPL 1', 17, 15, 15, 17, NOW(), NOW()),
(24, 1, 2402, 'quiz', 'Quiz RPL 1', 17, 17, 17, 17, NOW(), NOW()),

-- Course 25-27 (FEB Surabaya)
(25, 1, 2501, 'assign', 'Tugas Bisnis Digital 1', 13, 11, 11, 13, NOW(), NOW()),
(25, 1, 2502, 'quiz', 'Quiz Bisnis Digital 1', 13, 13, 13, 13, NOW(), NOW()),
(26, 1, 2601, 'assign', 'Tugas E-Commerce 1', 12, 10, 10, 12, NOW(), NOW()),
(26, 1, 2602, 'quiz', 'Quiz E-Commerce 1', 12, 12, 12, 12, NOW(), NOW()),
(27, 1, 2701, 'assign', 'Tugas Digital Marketing 1', 14, 12, 12, 14, NOW(), NOW()),
(27, 1, 2702, 'quiz', 'Quiz Digital Marketing 1', 14, 14, 14, 14, NOW(), NOW()),

-- Course 28-29 (FEB Purwokerto)
(28, 1, 2801, 'assign', 'Tugas Bisnis Digital PWT 1', 11, 9, 9, 11, NOW(), NOW()),
(28, 1, 2802, 'quiz', 'Quiz Bisnis Digital PWT 1', 11, 11, 11, 11, NOW(), NOW()),
(29, 1, 2901, 'assign', 'Tugas Manajemen Bisnis PWT 1', 10, 8, 8, 10, NOW(), NOW()),
(29, 1, 2902, 'quiz', 'Quiz Manajemen Bisnis PWT 1', 10, 10, 10, 10, NOW(), NOW());

-- Menambahkan data assignment dengan nilai bervariasi
INSERT INTO monev_cp_student_assignment_detail (assignment_id, user_id, nim, full_name, waktu_pengerjaan, nilai, created_at) VALUES
-- Course 11: Manajemen Keuangan (FEB Bandung)
(1101, 51, '2021051', 'Student AA11', NULL, 88.00, NOW()),
(1101, 52, '2021052', 'Student BB11', NULL, 92.00, NOW()),
(1101, 53, '2021053', 'Student CC11', NULL, 85.00, NOW()),
(1101, 54, '2021054', 'Student DD11', NULL, 90.00, NOW()),
(1101, 55, '2021055', 'Student EE11', NULL, 87.00, NOW()),

-- Course 12: Pemasaran Strategis (FEB Bandung)
(1201, 56, '2021056', 'Student FF12', NULL, 91.00, NOW()),
(1201, 57, '2021057', 'Student GG12', NULL, 86.00, NOW()),
(1201, 58, '2021058', 'Student HH12', NULL, 93.00, NOW()),
(1201, 59, '2021059', 'Student II12', NULL, 89.00, NOW()),
(1201, 60, '2021060', 'Student JJ12', NULL, 84.00, NOW()),

-- Course 13: Akuntansi Dasar (FEB Bandung)
(1301, 61, '2021061', 'Student KK13', NULL, 87.00, NOW()),
(1301, 62, '2021062', 'Student LL13', NULL, 92.00, NOW()),
(1301, 63, '2021063', 'Student MM13', NULL, 85.00, NOW()),
(1301, 64, '2021064', 'Student NN13', NULL, 90.00, NOW()),
(1301, 65, '2021065', 'Student OO13', NULL, 88.00, NOW()),

-- Course 14: Akuntansi Lanjutan (FEB Bandung)
(1401, 66, '2021066', 'Student PP14', NULL, 89.00, NOW()),
(1401, 67, '2021067', 'Student QQ14', NULL, 93.00, NOW()),
(1401, 68, '2021068', 'Student RR14', NULL, 86.00, NOW()),
(1401, 69, '2021069', 'Student SS14', NULL, 91.00, NOW()),
(1401, 70, '2021070', 'Student TT14', NULL, 87.00, NOW()),

-- Course 15: Administrasi Bisnis (FEB Bandung)
(1501, 71, '2021071', 'Student UU15', NULL, 88.00, NOW()),
(1501, 72, '2021072', 'Student VV15', NULL, 92.00, NOW()),
(1501, 73, '2021073', 'Student WW15', NULL, 85.00, NOW()),
(1501, 74, '2021074', 'Student XX15', NULL, 90.00, NOW()),
(1501, 75, '2021075', 'Student YY15', NULL, 87.00, NOW()),

-- Course 16: Pemrograman Dasar (FIF Bandung)
(1601, 76, '2021076', 'Student ZZ16', NULL, 91.00, NOW()),
(1601, 77, '2021077', 'Student AAA16', NULL, 86.00, NOW()),
(1601, 78, '2021078', 'Student BBB16', NULL, 94.00, NOW()),
(1601, 79, '2021079', 'Student CCC16', NULL, 88.00, NOW()),
(1601, 80, '2021080', 'Student DDD16', NULL, 92.00, NOW()),

-- Course 17: Struktur Data (FIF Bandung)
(1701, 81, '2021081', 'Student EEE17', NULL, 89.00, NOW()),
(1701, 82, '2021082', 'Student FFF17', NULL, 93.00, NOW()),
(1701, 83, '2021083', 'Student GGG17', NULL, 87.00, NOW()),
(1701, 84, '2021084', 'Student HHH17', NULL, 91.00, NOW()),
(1701, 85, '2021085', 'Student III17', NULL, 85.00, NOW()),

-- Course 18: Algoritma (FIF Bandung)
(1801, 86, '2021086', 'Student JJJ18', NULL, 90.00, NOW()),
(1801, 87, '2021087', 'Student KKK18', NULL, 88.00, NOW()),
(1801, 88, '2021088', 'Student LLL18', NULL, 93.00, NOW()),
(1801, 89, '2021089', 'Student MMM18', NULL, 86.00, NOW()),
(1801, 90, '2021090', 'Student NNN18', NULL, 92.00, NOW()),

-- Course 19: Basis Data (FIF Bandung)
(1901, 91, '2021091', 'Student OOO19', NULL, 87.00, NOW()),
(1901, 92, '2021092', 'Student PPP19', NULL, 91.00, NOW()),
(1901, 93, '2021093', 'Student QQQ19', NULL, 89.00, NOW()),
(1901, 94, '2021094', 'Student RRR19', NULL, 94.00, NOW()),
(1901, 95, '2021095', 'Student SSS19', NULL, 85.00, NOW()),

-- Course 20: Pemrograman Web (FIF Bandung)
(2001, 96, '2021096', 'Student TTT20', NULL, 92.00, NOW()),
(2001, 97, '2021097', 'Student UUU20', NULL, 88.00, NOW()),
(2001, 98, '2021098', 'Student VVV20', NULL, 90.00, NOW()),
(2001, 99, '2021099', 'Student WWW20', NULL, 86.00, NOW()),
(2001, 100, '2021100', 'Student XXX20', NULL, 93.00, NOW()),

-- Course 21: Manajemen Produksi (FIT Bandung)
(2101, 101, '2021101', 'Student YYY21', NULL, 89.00, NOW()),
(2101, 102, '2021102', 'Student ZZZ21', NULL, 91.00, NOW()),
(2101, 103, '2021103', 'Student AAAA21', NULL, 87.00, NOW()),
(2101, 104, '2021104', 'Student BBBB21', NULL, 93.00, NOW()),
(2101, 105, '2021105', 'Student CCCC21', NULL, 85.00, NOW()),

-- Course 22: Sistem Informasi (FIT Bandung)
(2201, 106, '2021106', 'Student DDDD22', NULL, 90.00, NOW()),
(2201, 107, '2021107', 'Student EEEE22', NULL, 88.00, NOW()),
(2201, 108, '2021108', 'Student FFFF22', NULL, 92.00, NOW()),
(2201, 109, '2021109', 'Student GGGG22', NULL, 86.00, NOW()),
(2201, 110, '2021110', 'Student HHHH22', NULL, 94.00, NOW()),

-- Course 23: Pemasaran Digital (FIT Bandung)
(2301, 111, '2021111', 'Student IIII23', NULL, 87.00, NOW()),
(2301, 112, '2021112', 'Student JJJJ23', NULL, 91.00, NOW()),
(2301, 113, '2021113', 'Student KKKK23', NULL, 89.00, NOW()),
(2301, 114, '2021114', 'Student LLLL23', NULL, 93.00, NOW()),
(2301, 115, '2021115', 'Student MMMM23', NULL, 85.00, NOW()),

-- Course 24: RPL (FIT Bandung)
(2401, 116, '2021116', 'Student NNNN24', NULL, 92.00, NOW()),
(2401, 117, '2021117', 'Student OOOO24', NULL, 88.00, NOW()),
(2401, 118, '2021118', 'Student PPPP24', NULL, 90.00, NOW()),
(2401, 119, '2021119', 'Student QQQQ24', NULL, 86.00, NOW()),
(2401, 120, '2021120', 'Student RRRR24', NULL, 94.00, NOW()),

-- Course 25: Bisnis Digital (FEB Surabaya)
(2501, 121, '2021121', 'Student SSSS25', NULL, 88.00, NOW()),
(2501, 122, '2021122', 'Student TTTT25', NULL, 91.00, NOW()),
(2501, 123, '2021123', 'Student UUUU25', NULL, 87.00, NOW()),
(2501, 124, '2021124', 'Student VVVV25', NULL, 93.00, NOW()),
(2501, 125, '2021125', 'Student WWWW25', NULL, 89.00, NOW()),

-- Course 26: E-Commerce (FEB Surabaya)
(2601, 126, '2021126', 'Student XXXX26', NULL, 90.00, NOW()),
(2601, 127, '2021127', 'Student YYYY26', NULL, 88.00, NOW()),
(2601, 128, '2021128', 'Student ZZZZ26', NULL, 92.00, NOW()),
(2601, 129, '2021129', 'Student AAAAA26', NULL, 86.00, NOW()),
(2601, 130, '2021130', 'Student BBBBB26', NULL, 94.00, NOW()),

-- Course 27: Digital Marketing (FEB Surabaya)
(2701, 131, '2021131', 'Student CCCCC27', NULL, 87.00, NOW()),
(2701, 132, '2021132', 'Student DDDDD27', NULL, 91.00, NOW()),
(2701, 133, '2021133', 'Student EEEEE27', NULL, 89.00, NOW()),
(2701, 134, '2021134', 'Student FFFFF27', NULL, 93.00, NOW()),
(2701, 135, '2021135', 'Student GGGGG27', NULL, 85.00, NOW()),

-- Course 28: Bisnis Digital PWT (FEB Purwokerto)
(2801, 136, '2021136', 'Student HHHHH28', NULL, 88.00, NOW()),
(2801, 137, '2021137', 'Student IIIII28', NULL, 91.00, NOW()),
(2801, 138, '2021138', 'Student JJJJJ28', NULL, 87.00, NOW()),
(2801, 139, '2021139', 'Student KKKKK28', NULL, 93.00, NOW()),
(2801, 140, '2021140', 'Student LLLLL28', NULL, 89.00, NOW()),

-- Course 29: Manajemen Bisnis PWT (FEB Purwokerto)
(2901, 141, '2021141', 'Student MMMMM29', NULL, 90.00, NOW()),
(2901, 142, '2021142', 'Student NNNNN29', NULL, 88.00, NOW()),
(2901, 143, '2021143', 'Student OOOOO29', NULL, 92.00, NOW()),
(2901, 144, '2021144', 'Student PPPPP29', NULL, 86.00, NOW()),
(2901, 145, '2021145', 'Student QQQQQ29', NULL, 94.00, NOW());

-- Menambahkan data quiz dengan nilai bervariasi
INSERT INTO monev_cp_student_quiz_detail (quiz_id, user_id, nim, full_name, waktu_mulai, waktu_selesai, durasi_waktu, jumlah_soal, jumlah_dikerjakan, nilai, created_at) VALUES
-- Course 11-15 (FEB Bandung) Quizzes
(1102, 51, '2021051', 'Student AA11', NOW(), NOW(), '00:30:00', 10, 10, 90.00, NOW()),
(1102, 52, '2021052', 'Student BB11', NOW(), NOW(), '00:25:00', 10, 10, 88.00, NOW()),
(1102, 53, '2021053', 'Student CC11', NOW(), NOW(), '00:35:00', 10, 10, 92.00, NOW()),
(1102, 54, '2021054', 'Student DD11', NOW(), NOW(), '00:28:00', 10, 10, 86.00, NOW()),
(1102, 55, '2021055', 'Student EE11', NOW(), NOW(), '00:32:00', 10, 10, 89.00, NOW()),

(1202, 56, '2021056', 'Student FF12', NOW(), NOW(), '00:30:00', 10, 10, 87.00, NOW()),
(1202, 57, '2021057', 'Student GG12', NOW(), NOW(), '00:25:00', 10, 10, 93.00, NOW()),
(1202, 58, '2021058', 'Student HH12', NOW(), NOW(), '00:35:00', 10, 10, 89.00, NOW()),
(1202, 59, '2021059', 'Student II12', NOW(), NOW(), '00:28:00', 10, 10, 91.00, NOW()),
(1202, 60, '2021060', 'Student JJ12', NOW(), NOW(), '00:32:00', 10, 10, 85.00, NOW()),

(1302, 61, '2021061', 'Student KK13', NOW(), NOW(), '00:30:00', 10, 10, 88.00, NOW()),
(1302, 62, '2021062', 'Student LL13', NOW(), NOW(), '00:25:00', 10, 10, 92.00, NOW()),
(1302, 63, '2021063', 'Student MM13', NOW(), NOW(), '00:35:00', 10, 10, 86.00, NOW()),
(1302, 64, '2021064', 'Student NN13', NOW(), NOW(), '00:28:00', 10, 10, 90.00, NOW()),
(1302, 65, '2021065', 'Student OO13', NOW(), NOW(), '00:32:00', 10, 10, 94.00, NOW()),

(1402, 66, '2021066', 'Student PP14', NOW(), NOW(), '00:30:00', 10, 10, 91.00, NOW()),
(1402, 67, '2021067', 'Student QQ14', NOW(), NOW(), '00:25:00', 10, 10, 87.00, NOW()),
(1402, 68, '2021068', 'Student RR14', NOW(), NOW(), '00:35:00', 10, 10, 93.00, NOW()),
(1402, 69, '2021069', 'Student SS14', NOW(), NOW(), '00:28:00', 10, 10, 89.00, NOW()),
(1402, 70, '2021070', 'Student TT14', NOW(), NOW(), '00:32:00', 10, 10, 85.00, NOW()),

(1502, 71, '2021071', 'Student UU15', NOW(), NOW(), '00:30:00', 10, 10, 90.00, NOW()),
(1502, 72, '2021072', 'Student VV15', NOW(), NOW(), '00:25:00', 10, 10, 88.00, NOW()),
(1502, 73, '2021073', 'Student WW15', NOW(), NOW(), '00:35:00', 10, 10, 92.00, NOW()),
(1502, 74, '2021074', 'Student XX15', NOW(), NOW(), '00:28:00', 10, 10, 86.00, NOW()),
(1502, 75, '2021075', 'Student YY15', NOW(), NOW(), '00:32:00', 10, 10, 89.00, NOW()),

-- Course 16-20 (FIF Bandung) Quizzes
(1602, 76, '2021076', 'Student ZZ16', NOW(), NOW(), '00:30:00', 10, 10, 87.00, NOW()),
(1602, 77, '2021077', 'Student AAA16', NOW(), NOW(), '00:25:00', 10, 10, 93.00, NOW()),
(1602, 78, '2021078', 'Student BBB16', NOW(), NOW(), '00:35:00', 10, 10, 89.00, NOW()),
(1602, 79, '2021079', 'Student CCC16', NOW(), NOW(), '00:28:00', 10, 10, 91.00, NOW()),
(1602, 80, '2021080', 'Student DDD16', NOW(), NOW(), '00:32:00', 10, 10, 85.00, NOW()),

(1702, 81, '2021081', 'Student EEE17', NOW(), NOW(), '00:30:00', 10, 10, 88.00, NOW()),
(1702, 82, '2021082', 'Student FFF17', NOW(), NOW(), '00:25:00', 10, 10, 92.00, NOW()),
(1702, 83, '2021083', 'Student GGG17', NOW(), NOW(), '00:35:00', 10, 10, 86.00, NOW()),
(1702, 84, '2021084', 'Student HHH17', NOW(), NOW(), '00:28:00', 10, 10, 90.00, NOW()),
(1702, 85, '2021085', 'Student III17', NOW(), NOW(), '00:32:00', 10, 10, 94.00, NOW()),

(1802, 86, '2021086', 'Student JJJ18', NOW(), NOW(), '00:30:00', 10, 10, 91.00, NOW()),
(1802, 87, '2021087', 'Student KKK18', NOW(), NOW(), '00:25:00', 10, 10, 87.00, NOW()),
(1802, 88, '2021088', 'Student LLL18', NOW(), NOW(), '00:35:00', 10, 10, 93.00, NOW()),
(1802, 89, '2021089', 'Student MMM18', NOW(), NOW(), '00:28:00', 10, 10, 89.00, NOW()),
(1802, 90, '2021090', 'Student NNN18', NOW(), NOW(), '00:32:00', 10, 10, 85.00, NOW()),

(1902, 91, '2021091', 'Student OOO19', NOW(), NOW(), '00:30:00', 10, 10, 90.00, NOW()),
(1902, 92, '2021092', 'Student PPP19', NOW(), NOW(), '00:25:00', 10, 10, 88.00, NOW()),
(1902, 93, '2021093', 'Student QQQ19', NOW(), NOW(), '00:35:00', 10, 10, 92.00, NOW()),
(1902, 94, '2021094', 'Student RRR19', NOW(), NOW(), '00:28:00', 10, 10, 86.00, NOW()),
(1902, 95, '2021095', 'Student SSS19', NOW(), NOW(), '00:32:00', 10, 10, 89.00, NOW()),

(2002, 96, '2021096', 'Student TTT20', NOW(), NOW(), '00:30:00', 10, 10, 87.00, NOW()),
(2002, 97, '2021097', 'Student UUU20', NOW(), NOW(), '00:25:00', 10, 10, 93.00, NOW()),
(2002, 98, '2021098', 'Student VVV20', NOW(), NOW(), '00:35:00', 10, 10, 89.00, NOW()),
(2002, 99, '2021099', 'Student WWW20', NOW(), NOW(), '00:28:00', 10, 10, 91.00, NOW()),
(2002, 100, '2021100', 'Student XXX20', NOW(), NOW(), '00:32:00', 10, 10, 85.00, NOW()),

-- Course 21-24 (FIT Bandung) Quizzes
(2102, 101, '2021101', 'Student YYY21', NOW(), NOW(), '00:30:00', 10, 10, 88.00, NOW()),
(2102, 102, '2021102', 'Student ZZZ21', NOW(), NOW(), '00:25:00', 10, 10, 92.00, NOW()),
(2102, 103, '2021103', 'Student AAAA21', NOW(), NOW(), '00:35:00', 10, 10, 86.00, NOW()),
(2102, 104, '2021104', 'Student BBBB21', NOW(), NOW(), '00:28:00', 10, 10, 90.00, NOW()),
(2102, 105, '2021105', 'Student CCCC21', NOW(), NOW(), '00:32:00', 10, 10, 94.00, NOW()),

(2202, 106, '2021106', 'Student DDDD22', NOW(), NOW(), '00:30:00', 10, 10, 91.00, NOW()),
(2202, 107, '2021107', 'Student EEEE22', NOW(), NOW(), '00:25:00', 10, 10, 87.00, NOW()),
(2202, 108, '2021108', 'Student FFFF22', NOW(), NOW(), '00:35:00', 10, 10, 93.00, NOW()),
(2202, 109, '2021109', 'Student GGGG22', NOW(), NOW(), '00:28:00', 10, 10, 89.00, NOW()),
(2202, 110, '2021110', 'Student HHHH22', NOW(), NOW(), '00:32:00', 10, 10, 85.00, NOW()),

(2302, 111, '2021111', 'Student IIII23', NOW(), NOW(), '00:30:00', 10, 10, 90.00, NOW()),
(2302, 112, '2021112', 'Student JJJJ23', NOW(), NOW(), '00:25:00', 10, 10, 88.00, NOW()),
(2302, 113, '2021113', 'Student KKKK23', NOW(), NOW(), '00:35:00', 10, 10, 92.00, NOW()),
(2302, 114, '2021114', 'Student LLLL23', NOW(), NOW(), '00:28:00', 10, 10, 86.00, NOW()),
(2302, 115, '2021115', 'Student MMMM23', NOW(), NOW(), '00:32:00', 10, 10, 89.00, NOW()),

(2402, 116, '2021116', 'Student NNNN24', NOW(), NOW(), '00:30:00', 10, 10, 87.00, NOW()),
(2402, 117, '2021117', 'Student OOOO24', NOW(), NOW(), '00:25:00', 10, 10, 93.00, NOW()),
(2402, 118, '2021118', 'Student PPPP24', NOW(), NOW(), '00:35:00', 10, 10, 89.00, NOW()),
(2402, 119, '2021119', 'Student QQQQ24', NOW(), NOW(), '00:28:00', 10, 10, 91.00, NOW()),
(2402, 120, '2021120', 'Student RRRR24', NOW(), NOW(), '00:32:00', 10, 10, 85.00, NOW()),

-- Course 25-27 (FEB Surabaya) Quizzes
(2502, 121, '2021121', 'Student SSSS25', NOW(), NOW(), '00:30:00', 10, 10, 88.00, NOW()),
(2502, 122, '2021122', 'Student TTTT25', NOW(), NOW(), '00:25:00', 10, 10, 92.00, NOW()),
(2502, 123, '2021123', 'Student UUUU25', NOW(), NOW(), '00:35:00', 10, 10, 86.00, NOW()),
(2502, 124, '2021124', 'Student VVVV25', NOW(), NOW(), '00:28:00', 10, 10, 90.00, NOW()),
(2502, 125, '2021125', 'Student WWWW25', NOW(), NOW(), '00:32:00', 10, 10, 94.00, NOW()),

(2602, 126, '2021126', 'Student XXXX26', NOW(), NOW(), '00:30:00', 10, 10, 91.00, NOW()),
(2602, 127, '2021127', 'Student YYYY26', NOW(), NOW(), '00:25:00', 10, 10, 87.00, NOW()),
(2602, 128, '2021128', 'Student ZZZZ26', NOW(), NOW(), '00:35:00', 10, 10, 93.00, NOW()),
(2602, 129, '2021129', 'Student AAAAA26', NOW(), NOW(), '00:28:00', 10, 10, 89.00, NOW()),
(2602, 130, '2021130', 'Student BBBBB26', NOW(), NOW(), '00:32:00', 10, 10, 85.00, NOW()),

(2702, 131, '2021131', 'Student CCCCC27', NOW(), NOW(), '00:30:00', 10, 10, 90.00, NOW()),
(2702, 132, '2021132', 'Student DDDDD27', NOW(), NOW(), '00:25:00', 10, 10, 88.00, NOW()),
(2702, 133, '2021133', 'Student EEEEE27', NOW(), NOW(), '00:35:00', 10, 10, 92.00, NOW()),
(2702, 134, '2021134', 'Student FFFFF27', NOW(), NOW(), '00:28:00', 10, 10, 86.00, NOW()),
(2702, 135, '2021135', 'Student GGGGG27', NOW(), NOW(), '00:32:00', 10, 10, 89.00, NOW()),

-- Course 28-29 (FEB Purwokerto) Quizzes
(2802, 136, '2021136', 'Student HHHHH28', NOW(), NOW(), '00:30:00', 10, 10, 87.00, NOW()),
(2802, 137, '2021137', 'Student IIIII28', NOW(), NOW(), '00:25:00', 10, 10, 93.00, NOW()),
(2802, 138, '2021138', 'Student JJJJJ28', NOW(), NOW(), '00:35:00', 10, 10, 89.00, NOW()),
(2802, 139, '2021139', 'Student KKKKK28', NOW(), NOW(), '00:28:00', 10, 10, 91.00, NOW()),
(2802, 140, '2021140', 'Student LLLLL28', NOW(), NOW(), '00:32:00', 10, 10, 85.00, NOW()),

(2902, 141, '2021141', 'Student MMMMM29', NOW(), NOW(), '00:30:00', 10, 10, 88.00, NOW()),
(2902, 142, '2021142', 'Student NNNNN29', NOW(), NOW(), '00:25:00', 10, 10, 92.00, NOW()),
(2902, 143, '2021143', 'Student OOOOO29', NOW(), NOW(), '00:35:00', 10, 10, 86.00, NOW()),
(2902, 144, '2021144', 'Student PPPPP29', NOW(), NOW(), '00:28:00', 10, 10, 90.00, NOW()),
(2902, 145, '2021145', 'Student QQQQQ29', NOW(), NOW(), '00:32:00', 10, 10, 94.00, NOW());
