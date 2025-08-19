#!/usr/bin/env node

const celoeApiGatewayService = require('../src/services/celoeapiGatewayService')

async function testSASAPI() {
  try {
    console.log('Testing SAS API connection...')
    
    // Test SAS ETL status
    console.log('\n1. Testing SAS ETL Status...')
    try {
      const statusResult = await celoeApiGatewayService.getSASETLStatus()
      console.log('✅ SAS ETL Status:', JSON.stringify(statusResult, null, 2))
    } catch (error) {
      console.log('❌ SAS ETL Status failed:', error.message)
    }
    
    // Test SAS ETL export with small limit
    console.log('\n2. Testing SAS ETL Export...')
    try {
      const exportResult = await celoeApiGatewayService.exportSASETLData(5, 0)
      console.log('✅ SAS ETL Export Response Structure:')
      console.log('Status:', exportResult.status)
      console.log('Has Next:', exportResult.has_next)
      console.log('Data Type:', typeof exportResult.data)
      console.log('Data Length:', exportResult.data ? exportResult.data.length : 'N/A')
      
      if (exportResult.data && exportResult.data.length > 0) {
        console.log('\nFirst Record Sample:')
        console.log(JSON.stringify(exportResult.data[0], null, 2))
      }
      
      console.log('\nFull Response:')
      console.log(JSON.stringify(exportResult, null, 2))
    } catch (error) {
      console.log('❌ SAS ETL Export failed:', error.message)
      if (error.stack) {
        console.log('Stack:', error.stack)
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    if (error.stack) {
      console.log('Stack:', error.stack)
    }
  } finally {
    process.exit(0)
  }
}

testSASAPI()

