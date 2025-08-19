#!/usr/bin/env node

async function testETL() {
  try {
    console.log('Testing SAS ETL process step by step...')
    
    const etlStudentActivitySummaryService = require('../src/services/etlStudentActivitySummaryService')
    console.log('✅ Service loaded successfully')
    
    // Test step 1: Check tables exist
    console.log('\n1. Testing table existence check...')
    try {
      await etlStudentActivitySummaryService.checkTablesExist()
      console.log('✅ All required tables exist')
    } catch (error) {
      console.log('❌ Table check failed:', error.message)
      return
    }
    
    // Test step 2: Clear existing data
    console.log('\n2. Testing data clearing...')
    try {
      await etlStudentActivitySummaryService.clearExistingData()
      console.log('✅ Data clearing successful')
    } catch (error) {
      console.log('❌ Data clearing failed:', error.message)
      return
    }
    
    // Test step 3: Fetch data from API
    console.log('\n3. Testing data fetching...')
    try {
      const allData = await etlStudentActivitySummaryService.fetchAllSASData()
      console.log(`✅ Data fetching successful: ${allData.length} records`)
    } catch (error) {
      console.log('❌ Data fetching failed:', error.message)
      return
    }
    
    // Test step 4: Process data
    console.log('\n4. Testing data processing...')
    try {
      const allData = await etlStudentActivitySummaryService.fetchAllSASData()
      const results = await etlStudentActivitySummaryService.processAllSASData(allData)
      console.log('✅ Data processing successful:', results)
    } catch (error) {
      console.log('❌ Data processing failed:', error.message)
      return
    }
    
    console.log('✅ All ETL steps passed')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    if (error.stack) {
      console.error('Stack:', error.stack)
    }
  } finally {
    process.exit(0)
  }
}

testETL()

