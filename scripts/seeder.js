// seeder.js
require('dotenv').config();
const mysql = require('mysql2/promise');
const { faker } = require('@faker-js/faker');
const dbConfig = require('../config/database');
const bcrypt = require('bcrypt'); // Import bcrypt untuk hashing password

// --- Konfigurasi Pengguna Mahasiswa Spesifik untuk Pengujian ---
const USER_ID_STUDENT = 123456789;
const NIM_STUDENT = '1301210001';
const FULL_NAME_STUDENT = 'Mahasiswa Uji Coba';
const USERNAME_STUDENT = 'mahasiswa.coba';
const EMAIL_STUDENT = 'mahasiswa.coba@student.telkomuniversity.ac.id';

// Fungsi utilitas untuk menghasilkan NIM
const generateNIM = (year, programCode) => {
    const nimPrefix = year.toString().substring(2, 4) + programCode;
    const nimSuffix = faker.string.numeric(5);
    return nimPrefix + nimSuffix;
};

// Fungsi utama untuk menjalankan seeder
const runSeeder = async () => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Terhubung ke database...');
        
        // Hashing password dummy
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        console.log('Mengambil data fakultas dan program studi...');
        const [categories] = await connection.execute(
            `SELECT category_id, category_name, category_type, category_parent_id FROM monev_sas_categories WHERE category_type IN ('FACULTY', 'STUDYPROGRAM')`
        );

        const faculties = categories.filter(cat => cat.category_type === 'FACULTY');
        const studyPrograms = categories.filter(cat => cat.category_type === 'STUDYPROGRAM');

        if (faculties.length === 0 || studyPrograms.length === 0) {
            console.error('Tidak ada data fakultas atau program studi yang ditemukan. Pastikan tabel monev_sas_categories sudah terisi.');
            connection.end();
            process.exit(1);
        }

        console.log('Menonaktifkan foreign key checks...');
        await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
        
        console.log('Mengosongkan tabel data dummy...');
        await connection.execute('TRUNCATE TABLE monev_sas_user_activity_etl'); 
        await connection.execute('TRUNCATE TABLE monev_cp_student_assignment_detail');
        await connection.execute('TRUNCATE TABLE monev_cp_student_quiz_detail');
        await connection.execute('TRUNCATE TABLE monev_cp_activity_summary');
        await connection.execute('TRUNCATE TABLE monev_cp_course_summary');
        await connection.execute('TRUNCATE TABLE monev_sas_courses');
        await connection.execute('TRUNCATE TABLE monev_users');
        await connection.execute('TRUNCATE TABLE monev_cp_student_profile');
        
        console.log('Mengaktifkan kembali foreign key checks...');
        await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
        
        // --- Ambil data program studi dan fakultas secara acak ---
        const userProdi = faker.helpers.arrayElement(studyPrograms);
        const userFakultas = faculties.find(f => f.category_id === userProdi.category_parent_id);

        if (!userProdi || !userFakultas) {
            console.error('Gagal mendapatkan program studi atau fakultas untuk pengguna uji coba.');
            connection.end();
            process.exit(1);
        }

        await connection.execute(
            `INSERT INTO monev_users (id, username, password, sub, name, kampus, fakultas, prodi, admin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [USER_ID_STUDENT, USERNAME_STUDENT, hashedPassword, NIM_STUDENT, FULL_NAME_STUDENT, 'Telkom University', userFakultas.category_name, userProdi.category_name, 0]
        );

        await connection.execute(
            `INSERT INTO monev_cp_student_profile (user_id, idnumber, full_name, email, program_studi) VALUES (?, ?, ?, ?, ?)`,
            [USER_ID_STUDENT, NIM_STUDENT, FULL_NAME_STUDENT, EMAIL_STUDENT, userProdi.category_name]
        );
        console.log('Pengguna mahasiswa uji coba berhasil dibuat.');

        const generatedCourses = [];
        const generatedActivities = [];
        let globalCourseId = 1000;
        let globalActivityId = 2000;

        for (const program of studyPrograms) {
            const faculty = faculties.find(f => f.category_id === program.category_parent_id);
            if (!faculty) continue; 

            const courseCount = faker.number.int({ min: 2, max: 4 });
            for (let i = 0; i < courseCount; i++) {
                const courseId = globalCourseId++;
                const courseName = `${faker.word.noun()}`;
                const subjectId = faker.string.uuid();
                const studentCount = faker.number.int({ min: 10, max: 50 });
                const activityCount = faker.number.int({ min: 3, max: 5 });
                const dosenPengampu = faker.person.fullName();

                generatedCourses.push({
                    course_id: courseId,
                    course_name: courseName,
                    program_id: program.category_id,
                    faculty_id: faculty.category_id,
                    student_count: studentCount,
                    activity_count: activityCount
                });

                await connection.execute(
                    `INSERT INTO monev_sas_courses (course_id, subject_id, course_name, faculty_id, program_id) VALUES (?, ?, ?, ?, ?)`,
                    [courseId, subjectId, courseName, faculty.category_id, program.category_id]
                );

                await connection.execute(
                    `INSERT INTO monev_cp_course_summary (course_id, course_name, kelas, jumlah_aktivitas, jumlah_mahasiswa, dosen_pengampu) VALUES (?, ?, ?, ?, ?, ?)`,
                    [courseId, courseName, faker.number.int({ min: 1, max: 5 }) + faker.string.alpha({ length: 1, casing: 'upper' }), activityCount, studentCount, dosenPengampu]
                );
            }
        }
        console.log('Data course dan summary berhasil dibuat.');

        for (const course of generatedCourses) {
            for (let i = 0; i < course.activity_count; i++) {
                const activityId = globalActivityId++;
                const activityType = faker.helpers.arrayElement(['Assignment', 'Quiz', 'Final Exam']);
                const activityName = `${activityType} ${i + 1}`;
                const submissionCount = faker.number.int({ min: course.student_count * 0.8, max: course.student_count });

                generatedActivities.push({
                    activity_id: activityId,
                    course_id: course.course_id,
                    student_count: course.student_count,
                    submission_count: submissionCount,
                    activity_type: activityType
                });

                await connection.execute(
                    `INSERT INTO monev_cp_activity_summary (course_id, activity_id, activity_type, activity_name, submission_count) VALUES (?, ?, ?, ?, ?)`,
                    [course.course_id, activityId, activityType, activityName, submissionCount]
                );
            }
        }
        console.log('Data activity berhasil dibuat.');
        
        const testUserCourses = faker.helpers.arrayElements(generatedCourses, faker.number.int({ min: 2, max: 4 })).map(c => c.course_id);
        
        for (const activity of generatedActivities) {
            const year = faker.number.int({ min: 2020, max: 2023 });
            
            const isTestUserCourse = testUserCourses.includes(activity.course_id);
            const submissionCount = isTestUserCourse ? activity.submission_count - 1 : activity.submission_count;
            
            for (let i = 0; i < submissionCount; i++) {
                const nim = generateNIM(year, faker.string.numeric(2));
                const fullName = faker.person.fullName();
                const grade = faker.number.float({ min: 50, max: 100, precision: 0.01 });
                const userId = faker.number.int({ min: 10000, max: 99999 });
                
                if (activity.activity_type === 'Assignment' || activity.activity_type === 'Final Exam') {
                    await connection.execute(
                        `INSERT INTO monev_cp_student_assignment_detail (assignment_id, user_id, nim, full_name, nilai) VALUES (?, ?, ?, ?, ?)`,
                        [activity.activity_id, userId, nim, fullName, grade]
                    );
                } else if (activity.activity_type === 'Quiz') {
                    const jumlahSoal = faker.number.int({ min: 10, max: 50 });
                    const jumlahDikerjakan = faker.number.int({ min: jumlahSoal - 5, max: jumlahSoal });
                    const waktuMulai = faker.date.recent({ days: 30 });
                    const waktuSelesai = faker.date.between({ from: waktuMulai, to: new Date() });
                    const durasiWaktu = Math.round((waktuSelesai.getTime() - waktuMulai.getTime()) / 1000);
    
                    await connection.execute(
                        `INSERT INTO monev_cp_student_quiz_detail (quiz_id, user_id, nim, full_name, waktu_mulai, waktu_selesai, durasi_waktu, jumlah_soal, jumlah_dikerjakan, nilai) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [activity.activity_id, userId, nim, fullName, waktuMulai, waktuSelesai, durasiWaktu, jumlahSoal, jumlahDikerjakan, grade]
                    );
                }
            }

            if (isTestUserCourse) {
                const grade = faker.number.float({ min: 50, max: 100, precision: 0.01 });
                if (activity.activity_type === 'Assignment' || activity.activity_type === 'Final Exam') {
                    await connection.execute(
                        `INSERT INTO monev_cp_student_assignment_detail (assignment_id, user_id, nim, full_name, nilai) VALUES (?, ?, ?, ?, ?)`,
                        [activity.activity_id, USER_ID_STUDENT, NIM_STUDENT, FULL_NAME_STUDENT, grade]
                    );
                } else if (activity.activity_type === 'Quiz') {
                    const jumlahSoal = faker.number.int({ min: 10, max: 50 });
                    const jumlahDikerjakan = faker.number.int({ min: jumlahSoal - 5, max: jumlahSoal });
                    const waktuMulai = faker.date.recent({ days: 30 });
                    const waktuSelesai = faker.date.between({ from: waktuMulai, to: new Date() });
                    const durasiWaktu = Math.round((waktuSelesai.getTime() - waktuMulai.getTime()) / 1000);
    
                    await connection.execute(
                        `INSERT INTO monev_cp_student_quiz_detail (quiz_id, user_id, nim, full_name, waktu_mulai, waktu_selesai, durasi_waktu, jumlah_soal, jumlah_dikerjakan, nilai) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [activity.activity_id, USER_ID_STUDENT, NIM_STUDENT, FULL_NAME_STUDENT, waktuMulai, waktuSelesai, durasiWaktu, jumlahSoal, jumlahDikerjakan, grade]
                    );
                }
            }
        }
        console.log('Data detail tugas dan kuis mahasiswa berhasil dibuat.');

        console.log('Seeding selesai!');
        connection.end();
        process.exit();

    } catch (error) {
        console.error('Error saat menjalankan seeder:', error);
        if (connection) {
            connection.end();
        }
        process.exit(1);
    }
};

runSeeder();