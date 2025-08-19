const database = require('../src/database/connection')
const logger = require('../src/utils/logger')

async function diagnoseQuizData() {
  try {
    console.log('🔍 Diagnosing Quiz Data Inconsistency...\n')
    
    const quizId = 9
    const courseId = 2
    
    // 1. Check activity summary
    console.log('📊 1. Activity Summary Data:')
    const [activitySummary] = await database.query(`
      SELECT * FROM monev_cp_activity_summary 
      WHERE course_id = ? AND activity_type = 'quiz' AND activity_id = ?
    `, [courseId, quizId])
    
    if (activitySummary) {
      console.log('✅ Activity Summary Found:')
      console.log(`   - graded_count: ${activitySummary.graded_count}`)
      console.log(`   - attempted_count: ${activitySummary.attempted_count}`)
      console.log(`   - accessed_count: ${activitySummary.accessed_count}`)
      console.log(`   - submission_count: ${activitySummary.submission_count}`)
    } else {
      console.log('❌ Activity Summary NOT Found')
    }
    
    // 2. Check student quiz detail
    console.log('\n👥 2. Student Quiz Detail Data:')
    const [studentQuizDetails] = await database.query(`
      SELECT COUNT(*) as total FROM monev_cp_student_quiz_detail 
      WHERE quiz_id = ?
    `, [quizId])
    
    console.log(`   - Total student quiz records: ${studentQuizDetails.total}`)
    
    // 3. Check specific student records
    console.log('\n📝 3. Specific Student Records:')
    const [studentRecords] = await database.query(`
      SELECT id, user_id, nim, full_name, nilai, waktu_mulai, waktu_selesai
      FROM monev_cp_student_quiz_detail 
      WHERE quiz_id = ?
      LIMIT 5
    `, [quizId])
    
    if (studentRecords && studentRecords.length > 0) {
      console.log('✅ Student Records Found:')
      studentRecords.forEach((record, index) => {
        console.log(`   ${index + 1}. ${record.full_name} (${record.nim}) - Nilai: ${record.nilai}`)
      })
    } else {
      console.log('❌ No Student Records Found')
    }
    
    // 4. Check if there's a data mismatch
    console.log('\n🔍 4. Data Consistency Analysis:')
    if (activitySummary && studentQuizDetails) {
      const summaryAttempted = activitySummary.attempted_count || 0
      const actualStudents = studentQuizDetails.total || 0
      
      console.log(`   - Summary says attempted_count: ${summaryAttempted}`)
      console.log(`   - Actual student records: ${actualStudents}`)
      
      if (summaryAttempted !== actualStudents) {
        console.log('⚠️  INCONSISTENCY DETECTED!')
        console.log('   - Activity summary and student detail counts do not match')
        console.log('   - This suggests data sync issues or ETL problems')
      } else {
        console.log('✅ Data is consistent')
      }
    }
    
    // 5. Check course summary
    console.log('\n📚 5. Course Summary Data:')
    const [courseSummary] = await database.query(`
      SELECT * FROM monev_cp_course_summary 
      WHERE course_id = ?
    `, [courseId])
    
    if (courseSummary) {
      console.log('✅ Course Summary Found:')
      console.log(`   - course_name: ${courseSummary.course_name}`)
      console.log(`   - kelas: ${courseSummary.kelas}`)
      console.log(`   - jumlah_mahasiswa: ${courseSummary.jumlah_mahasiswa}`)
      console.log(`   - jumlah_aktivitas: ${courseSummary.jumlah_aktivitas}`)
    } else {
      console.log('❌ Course Summary NOT Found')
    }
    
    console.log('\n🎯 Diagnosis Complete!')
    
  } catch (error) {
    console.error('❌ Error during diagnosis:', error.message)
  } finally {
    process.exit(0)
  }
}

diagnoseQuizData()
