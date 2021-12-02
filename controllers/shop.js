const Product = require('../models/product');
const Order = require('../models/order');
const User = require('../models/user');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const printf = require('printf');
const { LEGAL_TLS_SOCKET_OPTIONS } = require('mongoose/node_modules/mongodb');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_PRIVKEY);

const ITEMS_PER_PAGE = 2;

exports.getProducts = (req, res) => {
    const page = +req.query.page || 1;
    const skip = (page - 1) * ITEMS_PER_PAGE;
    let totalItems;

    return Product.countDocuments()
        .then((productCount) => {
            totalItems = productCount;
            return Product.find().skip(skip).limit(ITEMS_PER_PAGE);
        })
        .then((products) => {
            res.render('shop/product-list', {
                prods: products,
                pageTitle: 'All Products',
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
                path: '/products',
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
};

exports.getProduct = (req, res) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then((product) => {
            res.render('shop/product-detail', {
                pageTitle: product.title,
                path: '/products',
                product: product,
            });
        })
        .catch((err) => {
            console.log(err);
            res.redirect('/');
        });
};

exports.getIndex = (req, res, next) => {
    const page = +req.query.page || 1;
    const skip = (page - 1) * ITEMS_PER_PAGE;
    let totalItems;

    return Product.countDocuments()
        .then((productCount) => {
            totalItems = productCount;
            return Product.find().skip(skip).limit(ITEMS_PER_PAGE);
        })
        .then((products) => {
            res.render('shop/index', {
                prods: products,
                pageTitle: 'Shop',
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
                path: '/',
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
};

exports.getCart = (req, res, next) => {
    req.user
        .getCart()
        .then((cart) => {
            res.render('shop/cart', {
                path: '/cart',
                pageTitle: 'Your Cart',
                cart: cart,
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
};

exports.postCart = (req, res) => {
    const prodId = req.body.productId;

    Product.findById(prodId)
        .then((product) => {
            return req.user.addToCart(product);
        })
        .then((result) => {
            res.redirect('/cart');
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
};

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    req.user
        .deleteProductFromCart(prodId)

        .then((result) => {
            res.redirect('/cart');
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
};

exports.getCheckout = (req, res, next) => {
    let userCart;
    return req.user
        .getCart()
        .then((cart) => {
            userCart = cart;
            return stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                success_url:
                    req.protocol +
                    '://' +
                    req.get('host') +
                    '/checkout/success',
                cancel_url:
                    req.protocol + '://' + req.get('host') + '/checkout/cancel',
                line_items: cart.items.map((i) => {
                    return {
                        name: i.product.title,
                        description: i.product.description,
                        amount: Math.floor(i.product.price * 100),
                        currency: 'USD',
                        quantity: i.quantity,
                    };
                }),
            });
        })
        .then((session) => {
            console.log('Payment session created: ', session);
            userCart.stripeSession = session.id;
            return req.user.save();
        })
        .then((result) => {
            res.render('shop/checkout', {
                path: '/checkout',
                pageTitle: 'Checkout',
                cart: userCart,
                products: userCart.items,
                sessionId: userCart.stripeSession,
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
};

exports.postOrder = (req, res, next) => {
    req.user
        .addOrder()
        .then((result) => {
            res.redirect('/orders');
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
};

exports.getCheckoutSuccess = (req, res, next) => {
    return res.render('shop/checkout-success', {
        path: '/checkout-success',
        pageTitle: 'Checkout-Success',
    });
};

// called without CSRF protection
exports.postPaymentWebhook = (req, res, next) => {
    const payload = req.body;
    console.log(payload);

    if (payload.type === 'checkout.session.completed') {
        // find cart for session id
        User.findOne({ 'cart.stripeSession': payload.data.object.id })
            .then((user) => {
                console.log(user);
                return user.addOrder();
            })
            .catch((err) => {
                console.log(err);
            });
    }

    res.status(200).send();
};

exports.getOrders = (req, res, next) => {
    const limit = req.query.limit || 5;
    let orderCount;
    req.user
        .getOrderCount()
        .then((count) => {
            orderCount = count;
            return req.user.getOrders(limit);
        })
        .then((orders) => {
            return res.render('shop/orders', {
                path: '/orders',
                pageTitle: 'Your Orders',
                orders: orders,
                limit: limit,
                hasMore: limit < orderCount,
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
};

exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;

    Order.findById(orderId)
        .then((order) => {
            if (!order) {
                return next(new Error('No order with this id'));
            }
            if (order.user.userId.toString() !== req.user._id.toString()) {
                return next(new Error('Unauthorized'));
            }
            const invoiceFileName = 'invoice-' + orderId + '.pdf';
            const invoicePath = path.join('data', 'invoices', invoiceFileName);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader(
                'Content-Disposition',
                'inline; filename="' + invoiceFileName + '"'
            );
            const doc = new PDFDocument();
            doc.pipe(fs.createWriteStream(invoicePath));
            doc.pipe(res);

            doc.fontSize(26).text('Invoice', { underline: true, bold: true });
            doc.fontSize(14);
            doc.font('Courier');
            doc.text('-----------------------------------------------');
            order.items.forEach((item) => {
                doc.text(
                    printf('%-15s', item.product.title) +
                        printf('%4d', item.quantity) +
                        printf('%10.2f €', item.product.price) +
                        printf('%14.2f €', item.product.price * item.quantity)
                );
            });
            doc.text('-----------------------------------------------');
            doc.text(printf('Sum: %40.2f €', order.totalPrice));

            doc.end();
        })
        .catch((err) => next(err));
};
