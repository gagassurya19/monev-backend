const Joi = require('@hapi/joi');

const authValidators = {
  registerSchema: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .description('User email address'),
    
    password: Joi.string()
      .min(8)
      .max(128)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])'))
      .required()
      .description('Password must contain at least 8 characters with uppercase, lowercase, number and special character'),
    
    firstName: Joi.string()
      .min(2)
      .max(50)
      .required()
      .description('User first name'),
    
    lastName: Joi.string()
      .min(2)
      .max(50)
      .required()
      .description('User last name'),
    
    role: Joi.string()
      .valid('admin', 'user', 'viewer')
      .default('user')
      .description('User role')
  }),

  loginSchema: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .description('User email address'),
    
    password: Joi.string()
      .required()
      .description('User password')
  }),

  refreshTokenSchema: Joi.object({
    refreshToken: Joi.string()
      .required()
      .description('Refresh token')
  })
};

module.exports = authValidators; 