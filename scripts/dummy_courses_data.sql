-- Dummy data untuk tabel monev_sas_courses
-- Struktur tabel: course_id, subject_id, course_name, course_shortname, faculty_id, program_id, visible, created_at, updated_at

-- Hapus data yang sudah ada untuk menghindari konflik
DELETE FROM monev_sas_courses;

-- Insert dummy data baru
INSERT INTO monev_sas_courses (course_id, subject_id, course_name, course_shortname, faculty_id, program_id, visible, created_at, updated_at) VALUES
(1, 'GIK4DAB2', 'KETERAMPILAN PRESENTASI BERBAHASA INGGRIS', 'Presentasi Inggris', 1884, 334, 1, NOW(), NOW()),
(2, 'UAKXCCB2', 'AGAMA KATOLIK', 'Agama Katolik', 1884, 334, 1, NOW(), NOW()),
(3, 'UAKXFCB2', 'AGAMA KONG HU CU', 'Agama Kong Hu Cu', 1884, 334, 1, NOW(), NOW()),
(4, 'GIK4DAB3', 'KETERAMPILAN PRESENTASI BERBAHASA INGGRIS LANJUTAN', 'Presentasi Inggris Lanjutan', 1884, 334, 1, NOW(), NOW()),
(5, 'UAKXCCB3', 'AGAMA KATOLIK LANJUTAN', 'Agama Katolik Lanjutan', 1884, 334, 1, NOW(), NOW()),
(6, 'UAKXFCB3', 'AGAMA KONG HU CU LANJUTAN', 'Agama Kong Hu Cu Lanjutan', 1884, 334, 1, NOW(), NOW()),
(7, 'GIK4DAB4', 'KETERAMPILAN PRESENTASI BERBAHASA INGGRIS MAHIR', 'Presentasi Inggris Mahir', 1884, 334, 1, NOW(), NOW()),
(8, 'UAKXCCB4', 'AGAMA KATOLIK MAHIR', 'Agama Katolik Mahir', 1884, 334, 1, NOW(), NOW()),
(9, 'UAKXFCB4', 'AGAMA KONG HU CU MAHIR', 'Agama Kong Hu Cu Mahir', 1884, 334, 1, NOW(), NOW()),
(10, 'GIK4DAB5', 'KETERAMPILAN PRESENTASI BERBAHASA INGGRIS EXPERT', 'Presentasi Inggris Expert', 1884, 334, 1, NOW(), NOW());

-- Data untuk fakultas lain
INSERT INTO monev_sas_courses (course_id, subject_id, course_name, course_shortname, faculty_id, program_id, visible, created_at, updated_at) VALUES
(11, 'TEK4DAB1', 'PEMROGRAMAN DASAR', 'Pemrograman Dasar', 1885, 335, 1, NOW(), NOW()),
(12, 'TEK4DAB2', 'STRUKTUR DATA', 'Struktur Data', 1885, 335, 1, NOW(), NOW()),
(13, 'TEK4DAB3', 'ALGORITMA DAN PEMROGRAMAN', 'Algoritma', 1885, 335, 1, NOW(), NOW()),
(14, 'TEK4DAB4', 'BASIS DATA', 'Basis Data', 1885, 335, 1, NOW(), NOW()),
(15, 'TEK4DAB5', 'PEMROGRAMAN BERORIENTASI OBJEK', 'PBO', 1885, 335, 1, NOW(), NOW());

-- Data untuk program studi lain
INSERT INTO monev_sas_courses (course_id, subject_id, course_name, course_shortname, faculty_id, program_id, visible, created_at, updated_at) VALUES
(16, 'EK4DAB1', 'EKONOMI MIKRO', 'Ekonomi Mikro', 1886, 336, 1, NOW(), NOW()),
(17, 'EK4DAB2', 'EKONOMI MAKRO', 'Ekonomi Makro', 1886, 336, 1, NOW(), NOW()),
(18, 'EK4DAB3', 'MANAJEMEN KEUANGAN', 'Manajemen Keuangan', 1886, 336, 1, NOW(), NOW()),
(19, 'EK4DAB4', 'AKUNTANSI DASAR', 'Akuntansi Dasar', 1886, 336, 1, NOW(), NOW()),
(20, 'EK4DAB5', 'STATISTIKA BISNIS', 'Statistika Bisnis', 1886, 336, 1, NOW(), NOW());
