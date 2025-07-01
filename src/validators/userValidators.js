const Joi = require('@hapi/joi');

const userValidators = {
  userIdParamSchema: Joi.object({
    id: Joi.number()
      .integer()
      .positive()
      .required()
      .description('User ID')
  }),

  getUsersQuerySchema: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .description('Page number for pagination'),
    
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(10)
      .description('Number of items per page'),
    
    search: Joi.string()
      .max(100)
      .description('Search term for name or email'),
    
    role: Joi.string()
      .valid('admin', 'user', 'viewer')
      .description('Filter by user role'),
    
    sortBy: Joi.string()
      .valid('id', 'firstName', 'lastName', 'email', 'createdAt', 'updatedAt')
      .default('createdAt')
      .description('Field to sort by'),
    
    sortOrder: Joi.string()
      .valid('asc', 'desc')
      .default('desc')
      .description('Sort order')
  }),

  updateUserSchema: Joi.object({
    firstName: Joi.string()
      .min(2)
      .max(50)
      .description('User first name'),
    
    lastName: Joi.string()
      .min(2)
      .max(50)
      .description('User last name'),
    
    email: Joi.string()
      .email()
      .description('User email address'),
    
    role: Joi.string()
      .valid('admin', 'user', 'viewer')
      .description('User role'),
    
    isActive: Joi.boolean()
      .description('User active status')
  }).min(1),

  changePasswordSchema: Joi.object({
    currentPassword: Joi.string()
      .required()
      .description('Current password'),
    
    newPassword: Joi.string()
      .min(8)
      .max(128)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])'))
      .required()
      .description('New password must contain at least 8 characters with uppercase, lowercase, number and special character'),
    
    confirmPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .description('Password confirmation must match new password')
  })
};

module.exports = userValidators; 