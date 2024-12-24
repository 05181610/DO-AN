const { body } = require('express-validator');

exports.validateRegister = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Họ tên không được để trống')
    .isLength({ min: 2 })
    .withMessage('Họ tên phải có ít nhất 2 ký tự'),
    
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email không được để trống')
    .isEmail()
    .withMessage('Email không hợp lệ'),
    
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Mật khẩu không được để trống')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
    
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Số điện thoại không được để trống')
    .matches(/(84|0[3|5|7|8|9])+([0-9]{8})\b/)
    .withMessage('Số điện thoại không hợp lệ'),
    
  body('role')
    .trim()
    .notEmpty()
    .withMessage('Loại tài khoản không được để trống')
    .isIn(['tenant', 'landlord'])
    .withMessage('Loại tài khoản không hợp lệ'),
]; 