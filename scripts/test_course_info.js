const axios = require('axios')
const config = require('../config')

async function testCourseInfo() {
  try {
    console.log('Testing Course Info API endpoint...')
    
    const baseUrl = config.celoeapi.baseUrl
    console.log(`Base URL: ${baseUrl}`)
    
    // Test course IDs that we know exist
    const courseIds = [2, 3, 4]
    
    for (const courseId of courseIds) {
      try {
        console.log(`\n--- Testing Course ID: ${courseId} ---`)
        const response = await axios.get(`${baseUrl}/api/courses/${courseId}`)
        
        console.log(`✅ Course ${courseId} API Response:`)
        console.log('Status:', response.status)
        console.log('Data:', JSON.stringify(response.data, null, 2))
        
        // Check if we have the expected fields
        if (response.data && response.data.data) {
          const course = response.data.data
          console.log('\n📋 Course Fields Found:')
          console.log('- subject_id:', course.subject_id || 'NOT FOUND')
          console.log('- course_name:', course.course_name || 'NOT FOUND')
          console.log('- course_shortname:', course.course_shortname || 'NOT FOUND')
          console.log('- faculty_id:', course.faculty_id || 'NOT FOUND')
          console.log('- program_id:', course.program_id || 'NOT FOUND')
        }
        
      } catch (error) {
        console.log(`❌ Course ${courseId} API Error:`)
        if (error.response) {
          console.log('Status:', error.response.status)
          console.log('Data:', error.response.data)
        } else {
          console.log('Error:', error.message)
        }
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error.message)
  }
}

testCourseInfo()
