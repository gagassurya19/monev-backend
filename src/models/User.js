const database = require('../database/connection');
const bcrypt = require('bcryptjs');
const config = require('../../config');

class User {
  constructor(data = {}) {
    this.id = data.id;
    this.email = data.email;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.password = data.password;
    this.role = data.role || 'user';
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Create a new user
  static async create(userData) {
    const { email, password, firstName, lastName, role = 'user' } = userData;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, config.security.saltRounds);
    
    const sql = `
      INSERT INTO users (email, password, firstName, lastName, role, isActive, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const result = await database.query(sql, [
      email, hashedPassword, firstName, lastName, role, true
    ]);
    
    return await User.findById(result.insertId);
  }

  // Find user by ID
  static async findById(id) {
    const sql = 'SELECT * FROM users WHERE id = ? AND isActive = true';
    const rows = await database.query(sql, [id]);
    
    if (rows.length === 0) {
      return null;
    }
    
    return new User(rows[0]);
  }

  // Find user by email
  static async findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ? AND isActive = true';
    const rows = await database.query(sql, [email]);
    
    if (rows.length === 0) {
      return null;
    }
    
    return new User(rows[0]);
  }

  // Get all users with pagination and filtering
  static async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      search = '',
      role = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;
    
    const offset = (page - 1) * limit;
    let whereConditions = ['isActive = true'];
    let queryParams = [];
    
    // Add search condition
    if (search) {
      whereConditions.push('(firstName LIKE ? OR lastName LIKE ? OR email LIKE ?)');
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern);
    }
    
    // Add role filter
    if (role) {
      whereConditions.push('role = ?');
      queryParams.push(role);
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Count total records
    const countSql = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    const countResult = await database.query(countSql, queryParams);
    const total = countResult[0].total;
    
    // Get paginated results
    const sql = `
      SELECT id, email, firstName, lastName, role, isActive, createdAt, updatedAt
      FROM users 
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder.toUpperCase()}
      LIMIT ? OFFSET ?
    `;
    
    queryParams.push(limit, offset);
    const rows = await database.query(sql, queryParams);
    
    return {
      users: rows.map(row => new User(row)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // Update user
  static async updateById(id, updateData) {
    const allowedFields = ['firstName', 'lastName', 'email', 'role', 'isActive'];
    const updates = [];
    const values = [];
    
    // Build dynamic update query
    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    updates.push('updatedAt = NOW()');
    values.push(id);
    
    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    await database.query(sql, values);
    
    return await User.findById(id);
  }

  // Delete user (soft delete)
  static async deleteById(id) {
    const sql = 'UPDATE users SET isActive = false, updatedAt = NOW() WHERE id = ?';
    const result = await database.query(sql, [id]);
    
    return result.affectedRows > 0;
  }

  // Verify password
  async verifyPassword(password) {
    return await bcrypt.compare(password, this.password);
  }

  // Update password
  async updatePassword(newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, config.security.saltRounds);
    const sql = 'UPDATE users SET password = ?, updatedAt = NOW() WHERE id = ?';
    await database.query(sql, [hashedPassword, this.id]);
    
    this.password = hashedPassword;
    this.updatedAt = new Date();
  }

  // Check if email exists (for registration)
  static async emailExists(email, excludeId = null) {
    let sql = 'SELECT COUNT(*) as count FROM users WHERE email = ?';
    let params = [email];
    
    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }
    
    const result = await database.query(sql, params);
    return result[0].count > 0;
  }

  // Convert to JSON (exclude password)
  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }

  // Get user's full name
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}

module.exports = User; 