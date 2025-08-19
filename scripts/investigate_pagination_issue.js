const database = require('../src/database/connection')

async function investigatePaginationIssue() {
  try {
    console.log('🔍 Investigating Pagination Issue for Quiz 9...\n')
    
    // 1. Check how many students actually attempted quiz 9
    console.log('📊 1. Checking actual student quiz attempts:')
    const quizAttempts = await database.query(`
      SELECT id, user_id, full_name, waktu_mulai, waktu_selesai, nilai
      FROM monev_cp_student_quiz_detail 
      WHERE quiz_id = 9
      ORDER BY id
    `)
    
    console.log(`   Found ${quizAttempts.length} quiz attempts:`)
    quizAttempts.forEach((attempt, index) => {
      console.log(`   ${index + 1}. ID: ${attempt.id}, User: ${attempt.full_name}, Score: ${attempt.nilai || 'N/A'}`)
    })
    
    // 2. Check activity summary for quiz 9
    console.log('\n📋 2. Checking activity summary for quiz 9:')
    const activitySummary = await database.query(`
      SELECT * FROM monev_cp_activity_summary 
      WHERE activity_id = 9 AND activity_type = 'quiz'
    `)
    
    if (activitySummary.length > 0) {
      const summary = activitySummary[0]
      console.log(`   ✅ Activity Summary Found:`)
      console.log(`      - attempted_count: ${summary.attempted_count}`)
      console.log(`      - graded_count: ${summary.graded_count}`)
      console.log(`      - course_id: ${summary.course_id}`)
    } else {
      console.log('   ❌ No activity summary found for quiz 9')
    }
    
    // 3. Check if there are duplicate records
    console.log('\n🔍 3. Checking for duplicate records:')
    const duplicateCheck = await database.query(`
      SELECT user_id, full_name, COUNT(*) as attempt_count
      FROM monev_cp_student_quiz_detail 
      WHERE quiz_id = 9
      GROUP BY user_id, full_name
      HAVING COUNT(*) > 1
    `)
    
    if (duplicateCheck.length > 0) {
      console.log('   ⚠️  Found duplicate attempts:')
      duplicateCheck.forEach(dup => {
        console.log(`      - User ${dup.full_name} (ID: ${dup.user_id}): ${dup.attempt_count} attempts`)
      })
    } else {
      console.log('   ✅ No duplicate attempts found')
    }
    
    // 4. Check if there are different quiz records with same activity_id
    console.log('\n🔍 4. Checking for different quiz records:')
    const allQuizRecords = await database.query(`
      SELECT DISTINCT quiz_id, course_id, activity_id
      FROM monev_cp_student_quiz_detail 
      WHERE course_id = 2
      ORDER BY quiz_id
    `)
    
    console.log('   Quiz records found:')
    allQuizRecords.forEach(quiz => {
      console.log(`      - Quiz ID: ${quiz.quiz_id}, Activity ID: ${quiz.activity_id}, Course: ${quiz.course_id}`)
    })
    
    // 5. Check if there are multiple quiz IDs for the same activity
    console.log('\n🔍 5. Checking for multiple quiz IDs per activity:')
    const activityQuizMapping = await database.query(`
      SELECT activity_id, COUNT(DISTINCT quiz_id) as quiz_count
      FROM monev_cp_student_quiz_detail 
      WHERE course_id = 2
      GROUP BY activity_id
      HAVING COUNT(DISTINCT quiz_id) > 1
    `)
    
    if (activityQuizMapping.length > 0) {
      console.log('   ⚠️  Found activities with multiple quiz IDs:')
      activityQuizMapping.forEach(mapping => {
        console.log(`      - Activity ${mapping.activity_id}: ${mapping.quiz_count} quiz IDs`)
      })
    } else {
      console.log('   ✅ No activities with multiple quiz IDs found')
    }
    
  } catch (error) {
    console.error('❌ Error investigating pagination issue:', error.message)
  } finally {
    process.exit(0)
  }
}

investigatePaginationIssue()
