const { body } = require('express-validator');

const validateSendMessage = [
  body('booking_id')
    .notEmpty()
    .withMessage('booking_id الزامی است')
    .isInt()
    .withMessage('booking_id باید عدد باشد'),
  body('receiver_id')
    .notEmpty()
    .withMessage('receiver_id الزامی است')
    .isInt()
    .withMessage('receiver_id باید عدد باشد'),
  body('content')
    .notEmpty()
    .withMessage('محتوای پیام الزامی است')
    .isLength({ min: 1, max: 5000 })
    .withMessage('پیام باید بین 1 تا 5000 کاراکتر باشد'),
];

module.exports = {
  validateSendMessage,
};
