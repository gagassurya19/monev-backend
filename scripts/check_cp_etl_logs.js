const database = require('../src/database/connection')

async function checkCPETLLogs() {
  try {
    console.log('📋 Checking CP ETL Logs...\n')
    
    const logs = await database.query(`
      SELECT id, start_date, end_date, status, offset 
      FROM monev_cp_fetch_logs 
      ORDER BY id DESC 
      LIMIT 10
    `)
    
    const logsArray = Array.isArray(logs) ? logs : (logs && logs[0] ? logs[0] : [])
    console.log(`Found ${logsArray.length} ETL logs:\n`)
    
    logsArray.forEach((log, index) => {
      const statusText = log.status === 1 ? '✅ FINISHED' : 
                        log.status === 2 ? '🔄 IN PROGRESS' : 
                        log.status === 3 ? '❌ FAILED' : '❓ UNKNOWN'
      
      console.log(`${index + 1}. ID: ${log.id}`)
      console.log(`   Status: ${statusText} (${log.status})`)
      console.log(`   Start: ${log.start_date}`)
      console.log(`   End: ${log.end_date}`)
      console.log(`   Offset: ${log.offset}`)
      console.log('')
    })
    
    // Check for failed runs
    const [failedCount] = await database.query(`
      SELECT COUNT(*) as failed FROM monev_cp_fetch_logs WHERE status = 3
    `)
    
    if (failedCount.failed > 0) {
      console.log(`⚠️  Found ${failedCount.failed} failed ETL runs!`)
    } else {
      console.log('✅ No failed ETL runs found')
    }
    
  } catch (error) {
    console.error('❌ Error checking ETL logs:', error.message)
  } finally {
    process.exit(0)
  }
}

checkCPETLLogs()
