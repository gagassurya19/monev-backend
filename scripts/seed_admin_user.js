#!/usr/bin/env node

/**
 * Admin User Seeder
 * Script untuk membuat user admin default pada sistem Monev Backend
 *
 * Usage:
 * node scripts/seed_admin_user.js
 *
 * Atau dengan npm script:
 * npm run seed:admin
 *
 * Environment Variables (Opsional):
 * - ADMIN_USERNAME: Username untuk admin default
 * - ADMIN_PASSWORD: Password untuk admin default
 * - ADMIN_NAME: Nama lengkap admin default
 * - ADMIN_KAMPUS: Nama kampus
 * - ADMIN_FAKULTAS: Nama fakultas
 * - ADMIN_PRODI: Nama program studi
 * - CREATE_SUPERADMIN: true/false untuk membuat superadmin tambahan
 */

const bcrypt = require("bcryptjs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

// Import database connection
const database = require("../src/database/connection");

// Default admin user configuration (dapat di-override dengan environment variables)
const DEFAULT_ADMIN_USER = {
  username: process.env.ADMIN_USERNAME || "admin",
  password: process.env.ADMIN_PASSWORD || "admin123", // Password default - HARUS DIUBAH setelah login pertama
  name: process.env.ADMIN_NAME || "Administrator",
  sub: process.env.ADMIN_USERNAME || "admin",
  kampus: process.env.ADMIN_KAMPUS || "Universitas Default",
  fakultas: process.env.ADMIN_FAKULTAS || "Fakultas Teknologi Informasi",
  prodi: process.env.ADMIN_PRODI || "Sistem Informasi",
  admin: 1, // 1 = admin, 0 = user biasa
  message: "User admin default yang dibuat oleh sistem",
};

// Alternative admin user (jika ingin membuat admin tambahan)
const ALTERNATIVE_ADMIN_USER = {
  username: "superadmin",
  password: "superadmin123",
  name: "Super Administrator",
  sub: "superadmin",
  kampus: process.env.ADMIN_KAMPUS || "Universitas Default",
  fakultas: process.env.ADMIN_FAKULTAS || "Fakultas Teknologi Informasi",
  prodi: process.env.ADMIN_PRODI || "Sistem Informasi",
  admin: 1,
  message: "User super admin tambahan",
};

/**
 * Hash password menggunakan bcrypt
 * @param {string} password - Password plain text
 * @returns {string} - Password yang sudah di-hash
 */
async function hashPassword(password) {
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Cek apakah user sudah ada berdasarkan username
 * @param {string} username - Username yang akan dicek
 * @returns {boolean} - True jika user sudah ada, false jika belum
 */
async function checkUserExists(username) {
  try {
    const sql = "SELECT id FROM monev_users WHERE username = ?";
    const rows = await database.query(sql, [username]);
    return rows.length > 0;
  } catch (error) {
    console.error(
      `Error checking user existence for ${username}:`,
      error.message
    );
    return false;
  }
}

/**
 * Buat user admin baru
 * @param {Object} userData - Data user yang akan dibuat
 * @returns {Object} - Result dari pembuatan user
 */
async function createAdminUser(userData) {
  try {
    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // SQL untuk insert user
    const sql = `
      INSERT INTO monev_users (
        username, password, sub, name, kampus, fakultas, prodi, 
        admin, message, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const params = [
      userData.username,
      hashedPassword,
      userData.sub,
      userData.name,
      userData.kampus,
      userData.fakultas,
      userData.prodi,
      userData.admin,
      userData.message,
    ];

    const result = await database.query(sql, params);

    return {
      success: true,
      message: `User admin '${userData.username}' berhasil dibuat`,
      userId: result.insertId,
      username: userData.username,
      name: userData.name,
    };
  } catch (error) {
    return {
      success: false,
      message: `Gagal membuat user admin '${userData.username}': ${error.message}`,
      error: error.message,
    };
  }
}

/**
 * Main function untuk menjalankan seeder
 */
async function main() {
  console.log("🚀 Memulai Admin User Seeder...");
  console.log("=====================================");

  // Show configuration
  console.log("📋 Configuration:");
  console.log(`   Default Admin: ${DEFAULT_ADMIN_USER.username}`);
  console.log(`   Kampus: ${DEFAULT_ADMIN_USER.kampus}`);
  console.log(`   Fakultas: ${DEFAULT_ADMIN_USER.fakultas}`);
  console.log(`   Prodi: ${DEFAULT_ADMIN_USER.prodi}`);
  console.log(
    `   Create Superadmin: ${
      process.env.CREATE_SUPERADMIN === "true" ? "Yes" : "No"
    }`
  );
  console.log("");

  try {
    // Test database connection
    console.log("📡 Testing database connection...");
    await database.query("SELECT 1");
    console.log("✅ Database connection successful");

    // Check if default admin exists
    console.log("\n🔍 Checking existing admin users...");
    const defaultAdminExists = await checkUserExists(
      DEFAULT_ADMIN_USER.username
    );
    const alternativeAdminExists = await checkUserExists(
      ALTERNATIVE_ADMIN_USER.username
    );

    if (defaultAdminExists) {
      console.log(`⚠️  User '${DEFAULT_ADMIN_USER.username}' sudah ada`);
    } else {
      console.log(
        `📝 Creating default admin user '${DEFAULT_ADMIN_USER.username}'...`
      );
      const result = await createAdminUser(DEFAULT_ADMIN_USER);

      if (result.success) {
        console.log(`✅ ${result.message}`);
        console.log(`   User ID: ${result.userId}`);
        console.log(`   Username: ${result.username}`);
        console.log(`   Name: ${result.name}`);
      } else {
        console.log(`❌ ${result.message}`);
      }
    }

    // Create superadmin if enabled
    if (process.env.CREATE_SUPERADMIN === "true") {
      if (alternativeAdminExists) {
        console.log(`⚠️  User '${ALTERNATIVE_ADMIN_USER.username}' sudah ada`);
      } else {
        console.log(
          `📝 Creating superadmin user '${ALTERNATIVE_ADMIN_USER.username}'...`
        );
        const result = await createAdminUser(ALTERNATIVE_ADMIN_USER);

        if (result.success) {
          console.log(`✅ ${result.message}`);
          console.log(`   User ID: ${result.userId}`);
          console.log(`   Username: ${result.username}`);
          console.log(`   Name: ${result.name}`);
        } else {
          console.log(`❌ ${result.message}`);
        }
      }
    } else {
      console.log(
        `⏭️  Skipping superadmin creation (CREATE_SUPERADMIN != 'true')`
      );
    }

    // Show summary
    console.log("\n📊 Summary:");
    console.log("=====================================");

    const allUsers = await database.query(
      "SELECT username, name, admin FROM monev_users ORDER BY id"
    );
    console.log(`Total users in system: ${allUsers.length}`);

    allUsers.forEach((user, index) => {
      const role = user.admin === 1 ? "ADMIN" : "USER";
      console.log(`${index + 1}. ${user.username} (${user.name}) - ${role}`);
    });

    console.log("\n🔐 Default Admin Credentials:");
    console.log("=====================================");
    console.log(`Username: ${DEFAULT_ADMIN_USER.username}`);
    console.log(
      `Password: ${
        DEFAULT_ADMIN_USER.username === "admin"
          ? DEFAULT_ADMIN_USER.password
          : "***"
      }`
    );

    if (process.env.CREATE_SUPERADMIN === "true") {
      console.log(`Alternative: ${ALTERNATIVE_ADMIN_USER.username}`);
      console.log(
        `Password: ${
          ALTERNATIVE_ADMIN_USER.username === "superadmin"
            ? ALTERNATIVE_ADMIN_USER.password
            : "***"
        }`
      );
    }

    console.log("\n⚠️  IMPORTANT:");
    console.log("=====================================");
    console.log("1. Ganti password default setelah login pertama!");
    console.log("2. Password default hanya untuk development/testing");
    console.log("3. Gunakan password yang kuat untuk production");
    console.log("4. Untuk custom admin, gunakan environment variables:");
    console.log("   - ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_NAME");
    console.log("   - ADMIN_KAMPUS, ADMIN_FAKULTAS, ADMIN_PRODI");

    console.log("\n🎉 Admin User Seeder selesai!");
  } catch (error) {
    console.error("\n❌ Error during seeding:", error.message);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  } finally {
    // Close database connection
    try {
      await database.end();
      console.log("\n🔌 Database connection closed");
    } catch (error) {
      console.error("Error closing database connection:", error.message);
    }

    process.exit(0);
  }
}

// Run seeder if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

module.exports = {
  createAdminUser,
  checkUserExists,
  hashPassword,
  DEFAULT_ADMIN_USER,
  ALTERNATIVE_ADMIN_USER,
};
