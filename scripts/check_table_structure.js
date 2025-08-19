const database = require('../src/database/connection')

async function checkTableStructure() {
  try {
    console.log('🔍 Checking table structure...\n')
    
    // Check student quiz detail table
    console.log('📊 monev_cp_student_quiz_detail structure:')
    const quizStructure = await database.query('DESCRIBE monev_cp_student_quiz_detail')
    const quizCols = Array.isArray(quizStructure) ? quizStructure : (quizStructure && quizStructure[0] ? quizStructure[0] : [])
    
    quizCols.forEach(col => {
      console.log(`   ${col.Field}\t${col.Type}\t${col.Null}\t${col.Key}\t${col.Default}`)
    })
    
    // Check what columns are in the API response
    console.log('\n📋 API Response columns for cp_student_quiz_detail:')
    const apiColumns = [
      'id', 'quiz_id', 'course_id', 'user_id', 'nim', 'full_name', 
      'waktu_mulai', 'waktu_selesai', 'durasi_waktu', 'jumlah_soal', 
      'jumlah_dikerjakan', 'nilai', 'created_at'
    ]
    
    apiColumns.forEach(col => {
      console.log(`   ${col}`)
    })
    
    // Find mismatches
    console.log('\n🔍 Column Mismatch Analysis:')
    const dbColumns = quizCols.map(col => col.Field)
    const missingInDB = apiColumns.filter(col => !dbColumns.includes(col))
    const extraInDB = dbColumns.filter(col => !apiColumns.includes(col))
    
    if (missingInDB.length > 0) {
      console.log(`   ❌ Missing in DB: ${missingInDB.join(', ')}`)
    }
    
    if (extraInDB.length > 0) {
      console.log(`   ⚠️  Extra in DB: ${extraInDB.join(', ')}`)
    }
    
    if (missingInDB.length === 0 && extraInDB.length === 0) {
      console.log('   ✅ All columns match!')
    }
    
  } catch (error) {
    console.error('❌ Error checking table structure:', error.message)
  } finally {
    process.exit(0)
  }
}

checkTableStructure()
