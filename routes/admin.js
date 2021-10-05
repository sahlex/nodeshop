
const express = require('express');

const adminController = require('../controllers/admin')

const router = express.Router();

router.get('/add-product', adminController.getAddProduct);
router.get('/products', adminController.getAdminProducts);

router.post('/add-product', adminController.postAddProduct);

module.exports = {
    routes: router
};
