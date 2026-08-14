const { body } = require('express-validator');

const validateCreateReview = [
  body('booking_id')
    .notEmpty()
    .withMessage('booking_id الزامی است')
    .isInt()
    .withMessage('booking_id باید عدد باشد'),
  body('rating')
    .notEmpty()
    .withMessage('امتیاز الزامی است')
    .isInt({ min: 1, max: 5 })
    .withMessage('امتیاز باید بین 1 تا 5 باشد'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('نظر نمی‌تواند بیش از 1000 کاراکتر باشد'),
];

const validateUpdateReview = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('امتیاز باید بین 1 تا 5 باشد'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('نظر نمی‌تواند بیش از 1000 کاراکتر باشد'),
];

module.exports = {
  validateCreateReview,
  validateUpdateReview,
};
