-- Monev Database Setup Script
-- Run this script as MySQL root user to create the database and user for Monev project

-- Create database
CREATE DATABASE IF NOT EXISTS monev_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Create test database
CREATE DATABASE IF NOT EXISTS monev_test_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Create user for monev application
CREATE USER IF NOT EXISTS 'monev_user'@'localhost' IDENTIFIED BY 'monev_password';
CREATE USER IF NOT EXISTS 'monev_user'@'%' IDENTIFIED BY 'monev_password';

-- Grant privileges to monev_user
GRANT ALL PRIVILEGES ON monev_db.* TO 'monev_user'@'localhost';
GRANT ALL PRIVILEGES ON monev_db.* TO 'monev_user'@'%';
GRANT ALL PRIVILEGES ON monev_test_db.* TO 'monev_user'@'localhost';
GRANT ALL PRIVILEGES ON monev_test_db.* TO 'monev_user'@'%';

-- Flush privileges
FLUSH PRIVILEGES;

-- Show created databases
SHOW DATABASES LIKE 'monev%';

-- Show user privileges
SHOW GRANTS FOR 'monev_user'@'localhost'; 