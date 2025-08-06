-- Create universal SAS logs table
-- This table replaces the specific monev_sas_fetch_categories_subject_logs table
-- and can be used for all types of ETL processes

USE monev_db;

-- Drop existing specific table if exists
DROP TABLE IF EXISTS monev_sas_fetch_categories_subject_logs;

-- Create universal logs table
CREATE TABLE IF NOT EXISTS monev_sas_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type_run ENUM('fetch_category_subject', 'fetch_course_performance', 'fetch_student_activity_summary') NOT NULL,
    start_date DATETIME,
    end_date DATETIME,
    duration VARCHAR(20),
    status VARCHAR(20),
    total_records INT,
    offset INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_start_date (start_date),
    INDEX idx_type_run (type_run),
    INDEX idx_type_status (type_run, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create universal realtime logs table
CREATE TABLE IF NOT EXISTS monev_sas_realtime_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    log_id INT NOT NULL,
    level ENUM('info', 'warning', 'error', 'debug', 'progress') NOT NULL,
    message TEXT,
    progress INT,
    data JSON,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_log_id (log_id),
    INDEX idx_level (level),
    INDEX idx_timestamp (timestamp),
    FOREIGN KEY (log_id) REFERENCES monev_sas_logs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert sample data for testing (optional)
-- INSERT INTO monev_sas_logs (type_run, start_date, status, total_records, offset) 
-- VALUES ('fetch_category_subject', NOW(), 'finished', 1000, 0);

-- Show table structure
DESCRIBE monev_sas_logs;
DESCRIBE monev_sas_realtime_logs;

-- Show indexes
SHOW INDEX FROM monev_sas_logs;
SHOW INDEX FROM monev_sas_realtime_logs; 