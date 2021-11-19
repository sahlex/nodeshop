const mongoose = require('mongoose');
const Order = require('../models/order');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    resetToken: String,
    resetTokenExpiration: Date,
    cart: {
        items: [
            {
                product: {
                    type: Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                quantity: { type: Number, required: true },
            },
        ],
        totalPrice: Number,
    },
});

// for this function to work, product data has to be populated
calcTotal = (cart) => {
    cart.totalPrice = cart.items.reduce((prev, current) => {
        return prev + current.product.price * current.quantity;
    }, 0);
};

userSchema.methods.addToCart = function (product) {
    const cartProductIndex = this.cart.items.findIndex((cp) => {
        return product._id.toString() === cp.product.toString();
    });

    return this.populate('cart.items.product').then((user) => {
        const cart = user.cart;
        console.log(cart);
        if (cartProductIndex >= 0) {
            // already in cart
            cart.items[cartProductIndex].quantity += 1;
        } else {
            // not yet in cart
            // find product
            cart.items.push({
                product: product,
                quantity: 1,
            });
        }

        calcTotal(cart);
        return user.save();
    });
};

userSchema.methods.getCart = function () {
    return this.populate('cart.items.product').then((user) => {
        // filter out deleted products
        let cleanedUpCart = false;
        user.cart.items = user.cart.items.filter((item) => {
            if (!item.product) {
                cleanedUpCart = true;
                return false;
            }
            return true;
        });

        calcTotal(user.cart);

        // save back sanitized cart
        if (cleanedUpCart) {
            return user.save().then((res) => {
                return user.cart;
            });
        }
        return user.cart;
    });
};

userSchema.methods.deleteProductFromCart = function (prodId) {
    return this.populate('cart.items.product').then((user) => {
        const newCartItems = this.cart.items.filter((item) => {
            return item.product._id.toString() !== prodId.toString();
        });

        user.cart.items = newCartItems;

        calcTotal(user.cart);
        return user.save();
    });
};

userSchema.methods.addOrder = function () {
    return this.populate('cart.items.product').then((user) => {
        const cart = user.cart;

        const order = new Order({
            ...cart,
            orderDate: new Date(),
            user: {
                userId: user,
                email: user.email,
            },
            totalPrice: cart.totalPrice,
        });

        return order
            .save()
            .then((result) => {
                this.cart = { items: [], totalPrice: 0 };
                return this.save();
            })
            .catch((err) => console.log(err));
    });
};

userSchema.methods.getOrders = function () {
    return Order.find({ 'user.userId': this })
        .then((orders) => {
            return orders;
        })
        .catch((err) => console.log(err));
};

const User = mongoose.model('user', userSchema);
module.exports = User;
