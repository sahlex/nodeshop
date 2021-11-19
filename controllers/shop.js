const Product = require('../models/product');
const Order = require('../models/order');
const User = require('../models/user');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const printf = require('printf');

exports.getProducts = (req, res) => {
    Product.find()
        .then((products) => {
            res.render('shop/product-list', {
                pageTitle: 'All Products',
                prods: products,
                path: '/products',
            });
        })
        .catch((err) => {
            console.log(err);
            res.redirect('/');
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
    Product.find()
        .then((products) => {
            res.render('shop/index', {
                prods: products,
                pageTitle: 'Shop',
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

exports.getOrders = (req, res, next) => {
    req.user
        .getOrders()
        .then((orders) => {
            res.render('shop/orders', {
                path: '/orders',
                pageTitle: 'Your Orders',
                orders: orders,
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
