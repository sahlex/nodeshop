const getDb = require('../util/database').getDb;
const mongodb = require('mongodb');
const Product = require('../models/product')

const ObjectId = mongodb.ObjectId;

calcTotal = (cart) => {
    cart.totalPrice = cart.items.reduce((prev, current) => {
        return prev + current.price * current.quantity;
    }, 0);
}

class User {
    constructor(username, email, cart, name, id) {
        this.email = email;
        this.username = username;
        this.cart = cart ? cart : { items: [], totalPrice: 0 };
        this.name = name;
        this._id = new mongodb.ObjectId(id);
    }

    save() {
        const db = getDb();
        if (this._id) {
            return db
                .collection('users')
                .updateOne({ _id: this._id }, { $set: this });
        } else {
            return db.collection('users').insertOne(this);
        }
    }

    addToCart(product) {
        const cartProductIndex = this.cart.items.findIndex((cp) => {
            return new mongodb.ObjectId(product._id).equals(cp.productId);
        });

        if (cartProductIndex >= 0) {
            // already in cart
            this.cart.items[cartProductIndex].quantity += 1;
            calcTotal(this.cart);
            return this.save();
        } else {
            // not yet in cart
            // find product
            return Product.findById(product._id)
                .then(prod => {
                    this.cart.items.push({
                        productId: new mongodb.ObjectId(prod._id),
                        price: +prod.price,
                        quantity: 1,
                    });
                    return this.cart;
                })
                .then(cart => {
                    calcTotal(this.cart);
                    return this.save();
                });
        }
    }

    getCart() {
        const db = getDb();
        const entries = this.cart.items.map((entry) => entry.productId);
        return db
            .collection('products')
            .find({ _id: { $in: entries } })
            .toArray()
            .then((products) => {
                // a product could have been deleted, check for this
                return products.map((p1) => {
                    const quantity = this.cart.items.find(
                        (p2) => p1._id.toString() === p2.productId.toString()
                    ).quantity;
                    const prod = { ...p1, quantity: quantity, price: p1.price };
                    return prod;
                });
            }).then(products => {
                return {
                    items: products
                };
            }).then(cart => {
                calcTotal(cart);
                return cart;
            });
    }

    deleteProductFromCart(prodId) {
        const newCartItems = this.cart.items.filter((item) => {
            return item.productId.toString() !== prodId.toString();
        });

        this.cart.items = newCartItems;
        calcTotal(this.cart);
        return this.save();
    }

    addOrder() {
        const db = getDb();
        return this.getCart()
            .then((cart) => {
                const order = {
                    ...cart,
                    user: {
                        _id: this._id,
                        name: this.name,
                    },
                    orderDate: new Date()
                };
                return db.collection('orders').insertOne(order);
            })
            .then((result) => {
                this.cart = { items: [] };
                return this.save();
            })
            .catch((err) => console.log(err));
    }

    getOrders() {
        let orderItems;
        const db = getDb();
        return db
            .collection('orders')
            .find({ 'user._id': this._id })
            .toArray()
            .catch((err) => console.log(err));
    }

    static findById(userId) {
        const db = getDb();
        return db
            .collection('users')
            .findOne({ _id: new mongodb.ObjectId(userId) })
            .then((user) => {
                return new User(
                    user.name,
                    user.email,
                    user.cart,
                    user.name,
                    user._id
                );
            })
            .catch((err) => {
                console.log(err);
                return null;
            });
    }
}

module.exports = User;
