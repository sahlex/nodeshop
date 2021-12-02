const express = require('express');
const shopController = require('../controllers/shop');

// Use body-parser to retrieve the raw body as a buffer
const bodyParser = require('body-parser');

const router = express.Router();
router.post('/stripe-webhook', express.json(), shopController.postPaymentWebhook);

module.exports = {
    routes: router
};
