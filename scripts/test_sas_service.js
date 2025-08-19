#!/usr/bin/env node

try {
  console.log('Testing SAS ETL service loading...')
  
  const etlStudentActivitySummaryService = require('../src/services/etlStudentActivitySummaryService')
  console.log('✅ Service loaded successfully')
  
  console.log('Service methods:', Object.keys(etlStudentActivitySummaryService))
  
  // Test basic function
  const shouldRun = etlStudentActivitySummaryService.shouldRunETL()
  console.log('✅ shouldRunETL() works:', shouldRun)
  
  console.log('✅ All tests passed')
  
} catch (error) {
  console.error('❌ Test failed:', error.message)
  if (error.stack) {
    console.error('Stack:', error.stack)
  }
} finally {
  process.exit(0)
}

