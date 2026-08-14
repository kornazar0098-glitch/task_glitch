const { body } = require('express-validator');

const validateCreateBooking = [
  body('task_id')
    .notEmpty()
    .withMessage('task_id الزامی است')
    .isInt()
    .withMessage('task_id باید عدد باشد'),
  body('proposed_price')
    .notEmpty()
    .withMessage('proposed_price الزامی است')
    .isNumeric()
    .withMessage('proposed_price باید عدد باشد')
    .custom((value) => value > 0)
    .withMessage('proposed_price باید بیشتر از صفر باشد'),
  body('message')
    .optional()
    .trim(),
];

module.exports = {
  validateCreateBooking,
};
