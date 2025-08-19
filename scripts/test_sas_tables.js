#!/usr/bin/env node

const database = require('../src/database/connection')

async function testSASTables() {
  try {
    console.log('Testing SAS tables connection...')
    
    // Test database connection
    const connectionTest = await database.query('SELECT 1 as test')
    console.log('✅ Database connection successful:', connectionTest)
    
    // Check if SAS tables exist
    const tables = [
      'monev_sas_courses',
      'monev_sas_activity_counts_etl', 
      'monev_sas_user_activity_etl',
      'monev_sas_user_counts_etl',
      'monev_sas_logs'
    ]
    
    for (const table of tables) {
      try {
        const result = await database.query(`SELECT COUNT(*) as count FROM ${table}`)
        console.log(`✅ Table ${table} exists with ${result[0].count} records`)
      } catch (error) {
        if (error.code === 'ER_NO_SUCH_TABLE') {
          console.log(`❌ Table ${table} does not exist`)
        } else {
          console.log(`❌ Error accessing table ${table}:`, error.message)
        }
      }
    }
    
    // Test inserting a log entry
    try {
      const insertResult = await database.query(`
        INSERT INTO monev_sas_logs (start_date, status, offset) 
        VALUES (NOW(), 1, 0)
      `)
      console.log('✅ Test log entry inserted successfully:', insertResult.insertId)
      
      // Clean up test entry
      await database.query(`DELETE FROM monev_sas_logs WHERE id = ?`, [insertResult.insertId])
      console.log('✅ Test log entry cleaned up')
    } catch (error) {
      console.log('❌ Error inserting test log entry:', error.message)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  } finally {
    process.exit(0)
  }
}

testSASTables()
