const express = require('express');
const { check, body } = require('express-validator/check');
const User = require('../models/user');
const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);
router.get('/signup', authController.getSignup);
router.post(
    '/signup',
    [
        body('email')
            .isEmail()
            .withMessage('Please enter a valid e-mail')
            .normalizeEmail()
            .custom((value) => {
                return User.findOne({ email: value }).then((user) => {
                    if (user) {
                        return Promise.reject(
                            'Email already used, please pick another one.'
                        );
                    }
                });
            }),
        body(
            'password',
            'Please enter a password with only numbers and test and at least 6 characters.'
        )
            .trim()
            .isLength({ min: 6 })
            .isAlphanumeric(),
        body('confirmPassword')
            .trim()
            .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match.');
            }
            return true;
        }),
    ],
    authController.postSignup
);
router.get('/logout', authController.logout);
router.post(
    '/login',
    [
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please enter a valid email address.'),
        body(
            'password',
            'Please enter a password with only numbers and text and at least 6 characters.'
        )
            .trim()
            .isAlphanumeric()
            .isLength({ min: 6 }),
    ],
    authController.postLogin
);
router.get('/reset/:token', authController.getResetPassword);
router.post('/reset-password', authController.postResetPassword);
router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);

module.exports = {
    routes: router,
};
