const express = require('express');
const { check, body } = require('express-validator/check');
const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

const productChecks = [
    body('title').trim().notEmpty().withMessage('Please give a product title'),
    body('price', 'Value has to be a decimal > 0')
        .isDecimal({ decimal_digits: '0,2' })
        .custom(value => value > 0),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('This field is mandatory'),
];

router.get('/add-product', isAuth, adminController.getAddProduct);
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);
router.post(
    '/edit-product',
    isAuth,
    productChecks,
    adminController.postEditProduct
);
router.get('/products', adminController.getAdminProducts);
router.post('/delete-product', isAuth, adminController.deleteProduct);
router.post(
    '/add-product',
    isAuth,
    productChecks,
    adminController.postAddProduct
);

module.exports = {
    routes: router,
};
