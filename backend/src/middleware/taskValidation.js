const { body } = require('express-validator');

const validateCreateTask = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('عنوان الزامی است')
    .isLength({ min: 5 })
    .withMessage('عنوان باید حداقل 5 کاراکتر باشد'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('توضیحات الزامی است')
    .isLength({ min: 10 })
    .withMessage('توضیحات باید حداقل 10 کاراکتر باشد'),
  body('category')
    .notEmpty()
    .withMessage('دسته‌بندی الزامی است')
    .isIn(['shopping', 'delivery', 'cleaning', 'handyman', 'moving', 'pet-care', 'personal-errands', 'other'])
    .withMessage('دسته‌بندی معتبر نیست'),
  body('budget')
    .notEmpty()
    .withMessage('بودجه الزامی است')
    .isNumeric()
    .withMessage('بودجه باید عدد باشد')
    .custom((value) => value > 0)
    .withMessage('بودجه باید بیشتر از صفر باشد'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('موقعیت الزامی است'),
  body('deadline')
    .notEmpty()
    .withMessage('تاریخ انجام الزامی است')
    .isISO8601()
    .withMessage('فرمت تاریخ معتبر نیست')
    .custom((value) => new Date(value) > new Date())
    .withMessage('تاریخ انجام باید در آینده باشد'),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('latitude معتبر نیست'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('longitude معتبر نیست'),
];

const validateUpdateTask = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5 })
    .withMessage('عنوان باید حداقل 5 کاراکتر باشد'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('توضیحات باید حداقل 10 کاراکتر باشد'),
  body('category')
    .optional()
    .isIn(['shopping', 'delivery', 'cleaning', 'handyman', 'moving', 'pet-care', 'personal-errands', 'other'])
    .withMessage('دسته‌بندی معتبر نیست'),
  body('budget')
    .optional()
    .isNumeric()
    .withMessage('بودجه باید عدد باشد')
    .custom((value) => value > 0)
    .withMessage('بودجه باید بیشتر از صفر باشد'),
  body('location')
    .optional()
    .trim(),
  body('deadline')
    .optional()
    .isISO8601()
    .withMessage('فرمت تاریخ معتبر نیست'),
  body('status')
    .optional()
    .isIn(['open', 'in_progress', 'completed', 'cancelled'])
    .withMessage('وضعیت معتبر نیست'),
];

module.exports = {
  validateCreateTask,
  validateUpdateTask,
};
