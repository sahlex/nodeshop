
const express = require('express');

const adminController = require('../controllers/admin')

const router = express.Router();

router.get('/add-product', adminController.getAddProduct);
router.get('/edit-product/:productId', adminController.getEditProduct);
router.post('/edit-product', adminController.postEditProduct);
router.get('/products', adminController.getAdminProducts);
router.post('/delete-product', adminController.deleteProduct);
router.post('/add-product', adminController.postAddProduct);

module.exports = {
    routes: router
};
