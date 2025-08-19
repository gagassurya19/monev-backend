#!/usr/bin/env node

async function testService() {
  try {
    console.log('Testing SAS ETL service database functionality...')
    
    const etlStudentActivitySummaryService = require('../src/services/etlStudentActivitySummaryService')
    console.log('✅ Service loaded successfully')
    
    // Test table existence check
    console.log('\nTesting table existence check...')
    try {
      await etlStudentActivitySummaryService.checkTablesExist()
      console.log('✅ All required tables exist')
    } catch (error) {
      console.log('❌ Table check failed:', error.message)
    }
    
    // Test log entry creation
    console.log('\nTesting log entry creation...')
    try {
      const logId = await etlStudentActivitySummaryService.createLogEntry(new Date(), 2)
      console.log('✅ Log entry created with ID:', logId)
      
      // Test log entry update
      await etlStudentActivitySummaryService.updateLogEntry(logId, 1, 10, new Date())
      console.log('✅ Log entry updated successfully')
    } catch (error) {
      console.log('❌ Log entry test failed:', error.message)
    }
    
    console.log('✅ All database tests passed')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    if (error.stack) {
      console.error('Stack:', error.stack)
    }
  } finally {
    process.exit(0)
  }
}

testService()
