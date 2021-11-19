const mongoose = require('mongoose');
// const User = require('../models/user');

const Schema = mongoose.Schema;

const orderSchema = new Schema({
    user: {
        email: {
            type: String,
            required: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        }
    },
    items: [
        {
            product: {
                type: Object,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }
    ],
    orderDate: Schema.Types.Date,
    totalPrice: Number
});

module.exports = mongoose.model('Order', orderSchema);
