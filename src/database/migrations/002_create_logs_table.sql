-- Create logs table
CREATE TABLE IF NOT EXISTS logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  level ENUM('error', 'warn', 'info', 'debug') NOT NULL,
  message TEXT NOT NULL,
  source VARCHAR(100) NOT NULL,
  userId INT NULL,
  metadata JSON NULL,
  tags JSON NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_logs_level (level),
  INDEX idx_logs_source (source),
  INDEX idx_logs_timestamp (timestamp),
  INDEX idx_logs_user (userId),
  INDEX idx_logs_created (createdAt),
  INDEX idx_logs_level_source (level, source),
  INDEX idx_logs_timestamp_level (timestamp, level),
  
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; 