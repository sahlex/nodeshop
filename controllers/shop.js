const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = (req, res) => {
    Product.fetchAll()
        .then(([rows, fieldData]) => {
            res.render('shop/product-list', {
                pageTitle: 'All Products',
                prods: rows,
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
        .then(([row, fieldData]) => {
            console.log(row);
            res.render('shop/product-detail', {
                pageTitle: row[0].title,
                path: '/products',
                product: row[0],
            });
        })
        .catch((err) => {
            console.log(err);
            res.redirect('/');
        });
};

exports.getIndex = (req, res, next) => {
    Product.fetchAll()
        .then(([rows, fieldData]) => {
            res.render('shop/index', {
                prods: rows,
                pageTitle: 'Shop',
                path: '/',
            });
        })
        .catch((err) => {
            console.log(err);
            res.redirect('/');
        });
};

exports.getCart = (req, res, next) => {
    res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
    });
};

exports.postCart = (req, res) => {
    const prodId = req.body.productId;

    Product.findById(prodId, (product) => {
        Cart.addProduct(product);
        res.redirect('/cart');
    });
};

exports.getOrders = (req, res, next) => {
    res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
    });
};

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
    });
};
