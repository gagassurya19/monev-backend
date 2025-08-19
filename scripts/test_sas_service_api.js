#!/usr/bin/env node

async function testServiceAPI() {
  try {
    console.log('Testing SAS ETL service API functionality...')
    
    const etlStudentActivitySummaryService = require('../src/services/etlStudentActivitySummaryService')
    console.log('✅ Service loaded successfully')
    
    // Test API connection
    console.log('\nTesting API connection...')
    try {
      const result = await etlStudentActivitySummaryService.testAPIConnection()
      console.log('✅ API connection test result:', result)
    } catch (error) {
      console.log('❌ API connection test failed:', error.message)
    }
    
    // Test fetching data from API
    console.log('\nTesting data fetching...')
    try {
      const data = await etlStudentActivitySummaryService.fetchDataFromAPI(5, 0)
      console.log('✅ Data fetch successful')
      console.log('Data structure:', {
        status: data.status,
        hasNext: data.has_next,
        dataLength: data.data ? data.data.length : 0
      })
    } catch (error) {
      console.log('❌ Data fetch failed:', error.message)
    }
    
    console.log('✅ All API tests passed')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    if (error.stack) {
      console.error('Stack:', error.stack)
    }
  } finally {
    process.exit(0)
  }
}

testServiceAPI()

