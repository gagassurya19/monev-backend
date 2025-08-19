const database = require('../src/database/connection')
const dbConfig = require('../config/database')

async function debugQuizQuery() {
  try {
    console.log('🔍 Debugging Quiz Query for Quiz ID 9...\n')
    
    const quizId = 9
    const filters = {}
    const pagination = { limit: 10, offset: 0 }
    
    console.log('📋 1. Raw Query Parameters:')
    console.log(`   - quizId: ${quizId}`)
    console.log(`   - filters: ${JSON.stringify(filters)}`)
    console.log(`   - pagination: ${JSON.stringify(pagination)}\n`)
    
    // 1. Test the WHERE clause
    console.log('🔍 2. Testing WHERE clause:')
    const where = [`sqd.quiz_id = ?`]
    const params = [quizId]
    
    if (filters.search) {
      where.push(`(sqd.full_name LIKE ? OR sqd.nim LIKE ?)`)
      params.push(`%${filters.search}%`, `%${filters.search}%`)
    }
    
    if (filters.program_studi) {
      where.push(`sp.program_studi LIKE ?`)
      params.push(`%${filters.program_studi}%`)
    }
    
    console.log(`   WHERE clause: ${where.join(' AND ')}`)
    console.log(`   Parameters: ${JSON.stringify(params)}\n`)
    
    // 2. Test COUNT query
    console.log('📊 3. Testing COUNT query:')
    const countQuery = `
      SELECT COUNT(*) as total FROM ${dbConfig.dbNames.main}.monev_cp_student_quiz_detail sqd
      LEFT JOIN ${dbConfig.dbNames.main}.monev_cp_student_profile sp ON sp.user_id = sqd.user_id
      WHERE ${where.join(' AND ')}
    `
    console.log(`   COUNT Query: ${countQuery}`)
    
    const [countRows] = await database.query(countQuery, params)
    const totalCount = countRows?.total || 0
    console.log(`   ✅ Total count: ${totalCount}\n`)
    
    // 3. Test data query without LIMIT
    console.log('📋 4. Testing data query WITHOUT LIMIT:')
    const dataQueryNoLimit = `
      SELECT sqd.id, sqd.user_id, sqd.nim, sqd.full_name, sp.program_studi,
             sqd.waktu_mulai, sqd.waktu_selesai, sqd.durasi_waktu AS durasi_pengerjaan,
             sqd.jumlah_soal, sqd.jumlah_dikerjakan, sqd.nilai, sqd.waktu_mulai AS waktu_aktivitas
      FROM ${dbConfig.dbNames.main}.monev_cp_student_quiz_detail sqd
      LEFT JOIN ${dbConfig.dbNames.main}.monev_cp_student_profile sp ON sp.user_id = sqd.user_id
      WHERE ${where.join(' AND ')}
      ORDER BY sqd.full_name ASC
    `
    console.log(`   Data Query (no limit): ${dataQueryNoLimit}`)
    
    const studentsNoLimit = await database.query(dataQueryNoLimit, params)
    console.log(`   ✅ Records found (no limit): ${studentsNoLimit.length}`)
    studentsNoLimit.forEach((student, index) => {
      console.log(`      ${index + 1}. ID: ${student.id}, User: ${student.full_name}, Score: ${student.nilai || 'N/A'}`)
    })
    
    // 4. Test data query WITH LIMIT
    console.log('\n📋 5. Testing data query WITH LIMIT:')
    const limit = pagination.limit || 10
    const offset = pagination.offset || 0
    
    const dataQueryWithLimit = `
      SELECT sqd.id, sqd.user_id, sqd.nim, sqd.full_name, sp.program_studi,
             sqd.waktu_mulai, sqd.waktu_selesai, sqd.durasi_waktu AS durasi_pengerjaan,
             sqd.jumlah_soal, sqd.jumlah_dikerjakan, sqd.nilai, sqd.waktu_mulai AS waktu_aktivitas
      FROM ${dbConfig.dbNames.main}.monev_cp_student_quiz_detail sqd
      LEFT JOIN ${dbConfig.dbNames.main}.monev_cp_student_profile sp ON sp.user_id = sqd.user_id
      WHERE ${where.join(' AND ')}
      ORDER BY sqd.full_name ASC
      LIMIT ${limit} OFFSET ${offset}
    `
    console.log(`   Data Query (with limit): ${dataQueryWithLimit}`)
    
    const studentsWithLimit = await database.query(dataQueryWithLimit, params)
    console.log(`   ✅ Records found (with limit): ${studentsWithLimit.length}`)
    studentsWithLimit.forEach((student, index) => {
      console.log(`      ${index + 1}. ID: ${student.id}, User: ${student.full_name}, Score: ${student.nilai || 'N/A'}`)
    })
    
    // 5. Check if there are any NULL values causing issues
    console.log('\n🔍 6. Checking for NULL values:')
    const nullCheckQuery = `
      SELECT sqd.id, sqd.user_id, sqd.nim, sqd.full_name, 
             sp.program_studi, sp.user_id as profile_user_id
      FROM ${dbConfig.dbNames.main}.monev_cp_student_quiz_detail sqd
      LEFT JOIN ${dbConfig.dbNames.main}.monev_cp_student_profile sp ON sp.user_id = sqd.user_id
      WHERE sqd.quiz_id = ?
      ORDER BY sqd.id
    `
    
    const nullCheckResult = await database.query(nullCheckQuery, [quizId])
    console.log(`   Records with JOIN check:`)
    nullCheckResult.forEach((record, index) => {
      console.log(`      ${index + 1}. Quiz ID: ${record.id}, User ID: ${record.user_id}, Profile User ID: ${record.profile_user_id || 'NULL'}`)
    })
    
  } catch (error) {
    console.error('❌ Error debugging quiz query:', error.message)
  } finally {
    process.exit(0)
  }
}

debugQuizQuery()
