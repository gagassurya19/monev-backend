const database = require('../src/database/connection')
const logger = require('../src/utils/logger')

async function updateCourseData() {
  try {
    console.log('Updating SAS course data with correct information...')
    
    // Course data mapping based on user's requirements
    const courseUpdates = [
      {
        course_id: 2,
        subject_id: 'GBK3BAB4',
        course_name: 'PEMROGRAMAN UNTUK PERANGKAT BERGERAK 2',
        course_shortname: 'PPB',
        faculty_id: 2,
        program_id: 4
      },
      {
        course_id: 3,
        subject_id: 'GHK3JAC3',
        course_name: 'PROYEK MULTIMEDIA 2',
        course_shortname: 'PM2',
        faculty_id: 3,
        program_id: 5
      },
      {
        course_id: 4,
        subject_id: 'GHK1JAB2',
        course_name: 'STATISTIKA',
        course_shortname: 'STATISTIKA',
        faculty_id: 2,
        program_id: 6
      }
    ]
    
    // Update each course
    for (const course of courseUpdates) {
      const updateQuery = `
        UPDATE monev_sas_courses 
        SET 
          subject_id = ?,
          course_name = ?,
          course_shortname = ?,
          faculty_id = ?,
          program_id = ?,
          updated_at = NOW()
        WHERE course_id = ?
      `
      
      const updateParams = [
        course.subject_id,
        course.course_name,
        course.course_shortname,
        course.faculty_id,
        course.program_id,
        course.course_id
      ]
      
      const result = await database.query(updateQuery, updateParams)
      console.log('Update result:', JSON.stringify(result, null, 2))
      
      if (result && result.affectedRows > 0) {
        console.log(`✅ Updated course ${course.course_id}: ${course.course_name}`)
      } else {
        console.log(`⚠️  No rows affected for course ${course.course_id}`)
      }
    }
    
    // Verify the updates
    console.log('\n📋 Verifying updated course data...')
    const verifyResult = await database.query('SELECT * FROM monev_sas_courses ORDER BY course_id')
    console.log('Verify result structure:', JSON.stringify(verifyResult, null, 2))
    
    const courses = verifyResult || []
    console.log('Courses array length:', courses.length)
    
    if (courses.length > 0) {
      console.log('\nUpdated Course Data:')
      courses.forEach(course => {
        console.log(`${course.course_id}\t${course.subject_id}\t${course.course_name}\t${course.course_shortname}\t${course.faculty_id}\t${course.program_id}\t${course.visible}\t${course.created_at}\t${course.updated_at}`)
      })
    } else {
      console.log('No courses found in verification query')
    }
    
    console.log('\n✅ Course data update completed successfully!')
    
  } catch (error) {
    console.error('❌ Error updating course data:', error.message)
  } finally {
    process.exit(0)
  }
}

updateCourseData()
