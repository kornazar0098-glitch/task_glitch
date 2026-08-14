const { body } = require('express-validator');

const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('نام الزامی است')
    .isLength({ min: 3 })
    .withMessage('نام باید حداقل 3 کاراکتر باشد'),
  body('email')
    .isEmail()
    .withMessage('ایمیل معتبر نیست')
    .normalizeEmail(),
  body('phone')
    .matches(/^09\d{9}$/)
    .withMessage('شماره تلفن معتبر نیست'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('رمز عبور باید حداقل 6 کاراکتر باشد'),
  body('role')
    .optional()
    .isIn(['customer', 'worker'])
    .withMessage('نقش معتبر نیست'),
];

const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('ایمیل معتبر نیست')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('رمز عبور الزامی است'),
];

const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('نام باید حداقل 3 کاراکتر باشد'),
  body('bio')
    .optional()
    .trim(),
  body('location')
    .optional()
    .trim(),
];

const validateChangePassword = [
  body('oldPassword')
    .notEmpty()
    .withMessage('رمز عبور قدیمی الزامی است'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('رمز عبور جدید باید حداقل 6 کاراکتر باشد'),
];

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
};
