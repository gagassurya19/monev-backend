const database = require('../src/database/connection')

async function checkQuizMapping() {
  try {
    console.log('🔍 Checking Quiz Activity vs Student Detail Mapping...\n')
    
    // Check all quiz activities
    console.log('📊 1. All Quiz Activities in Summary:')
    const quizActivities = await database.query(`
      SELECT activity_id, course_id, attempted_count, graded_count 
      FROM monev_cp_activity_summary 
      WHERE activity_type = 'quiz' 
      ORDER BY activity_id
    `)
    
    const activities = Array.isArray(quizActivities) ? quizActivities : (quizActivities && quizActivities[0] ? quizActivities[0] : [])
    
    if (activities.length > 0) {
      activities.forEach(quiz => {
        console.log(`   Quiz ID: ${quiz.activity_id}, Course: ${quiz.course_id}, Attempts: ${quiz.attempted_count}, Graded: ${quiz.graded_count}`)
      })
    } else {
      console.log('   No quiz activities found')
    }
    
    // Check student quiz details
    console.log('\n👥 2. Student Quiz Details:')
    const studentDetails = await database.query(`
      SELECT quiz_id, COUNT(*) as student_count 
      FROM monev_cp_student_quiz_detail 
      GROUP BY quiz_id 
      ORDER BY quiz_id
    `)
    
    const details = Array.isArray(studentDetails) ? studentDetails : (studentDetails && studentDetails[0] ? studentDetails[0] : [])
    
    if (details.length > 0) {
      details.forEach(detail => {
        console.log(`   Quiz ID: ${detail.quiz_id}: ${detail.student_count} students`)
      })
    } else {
      console.log('   No student quiz details found')
    }
    
    // Check for mismatches
    console.log('\n🔍 3. Data Consistency Analysis:')
    const activityMap = new Map()
    const detailMap = new Map()
    
    activities.forEach(quiz => {
      activityMap.set(quiz.activity_id, quiz.attempted_count || 0)
    })
    
    details.forEach(detail => {
      detailMap.set(detail.quiz_id, detail.student_count || 0)
    })
    
    let mismatches = 0
    activityMap.forEach((attempts, quizId) => {
      const students = detailMap.get(quizId) || 0
      if (attempts !== students) {
        console.log(`   ⚠️  Quiz ${quizId}: Summary says ${attempts} attempts, but ${students} student records`)
        mismatches++
      } else {
        console.log(`   ✅ Quiz ${quizId}: ${attempts} attempts = ${students} student records`)
      }
    })
    
    if (mismatches > 0) {
      console.log(`\n⚠️  Found ${mismatches} data inconsistencies!`)
    } else {
      console.log('\n✅ All quiz data is consistent!')
    }
    
  } catch (error) {
    console.error('❌ Error checking quiz mapping:', error.message)
  } finally {
    process.exit(0)
  }
}

checkQuizMapping()
