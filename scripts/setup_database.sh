#!/bin/bash

# Monev Database Setup Script
# This script will help you set up the MySQL database for the Monev project

echo "=== Monev Database Setup ==="
echo "This script will create the database and user for the Monev project"
echo ""

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "Error: MySQL is not installed. Please install MySQL first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "Please edit .env file with your database credentials"
    echo ""
fi

# Read database configuration from .env file
source .env

echo "Database Configuration:"
echo "Host: $DB_HOST"
echo "Port: $DB_PORT"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo ""

# Ask for MySQL root password (optional)
echo "Please enter your MySQL root password (press Enter if no password):"
read -s MYSQL_ROOT_PASSWORD

echo ""
echo "Setting up database..."

# Create database and user
if [ -z "$MYSQL_ROOT_PASSWORD" ]; then
    mysql -u root << EOF
-- Create database
CREATE DATABASE IF NOT EXISTS $DB_NAME
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Create test database
CREATE DATABASE IF NOT EXISTS ${DB_NAME}_test
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Create user for monev application
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
CREATE USER IF NOT EXISTS '$DB_USER'@'%' IDENTIFIED BY '$DB_PASSWORD';

-- Grant privileges to monev_user
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'%';
GRANT ALL PRIVILEGES ON ${DB_NAME}_test.* TO '$DB_USER'@'localhost';
GRANT ALL PRIVILEGES ON ${DB_NAME}_test.* TO '$DB_USER'@'%';

-- Flush privileges
FLUSH PRIVILEGES;

-- Show created databases
SHOW DATABASES LIKE '${DB_NAME}%';
EOF
else
    mysql -u root -p$MYSQL_ROOT_PASSWORD << EOF
-- Create database
CREATE DATABASE IF NOT EXISTS $DB_NAME
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Create test database
CREATE DATABASE IF NOT EXISTS ${DB_NAME}_test
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Create user for monev application
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
CREATE USER IF NOT EXISTS '$DB_USER'@'%' IDENTIFIED BY '$DB_PASSWORD';

-- Grant privileges to monev_user
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'%';
GRANT ALL PRIVILEGES ON ${DB_NAME}_test.* TO '$DB_USER'@'localhost';
GRANT ALL PRIVILEGES ON ${DB_NAME}_test.* TO '$DB_USER'@'%';

-- Flush privileges
FLUSH PRIVILEGES;

-- Show created databases
SHOW DATABASES LIKE '${DB_NAME}%';
EOF
fi

if [ $? -eq 0 ]; then
    echo "Database setup completed successfully!"
    echo ""
    echo "Now creating tables..."
    
    # Create tables
    mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME < scripts/create_monev_tables.sql
    
    if [ $? -eq 0 ]; then
        echo "Tables created successfully!"
        echo ""
        echo "=== Setup Complete ==="
        echo "Database: $DB_NAME"
        echo "User: $DB_USER"
        echo "You can now start the application with: npm run dev"
    else
        echo "Error: Failed to create tables"
        exit 1
    fi
else
    echo "Error: Failed to setup database"
    exit 1
fi 