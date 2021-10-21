const Product = require('../models/product');
const User = require('../models/user');

exports.getProducts = (req, res) => {
    Product.fetchAll()
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
            console.log(product);
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
    Product.fetchAll()
        .then((products) => {
            res.render('shop/index', {
                prods: products,
                pageTitle: 'Shop',
                path: '/',
            });
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.getCart = (req, res, next) => {
    req.user.getCart().then((cart) => {
        // console.log('Cart: ', productsInCart);
        res.render('shop/cart', {
            path: '/cart',
            pageTitle: 'Your Cart',
            
            cart: cart,
        });
    });
};

exports.postCart = (req, res) => {
    const prodId = req.body.productId;
    let theCart;
    let newQuantity = 1;

    Product.findById(prodId)
        .then((product) => {
            return req.user.addToCart(product);
        })
        .then((result) => {
            res.redirect('/cart');
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    req.user
        .deleteProductFromCart(prodId)

        .then((result) => {
            res.redirect('/cart');
        })
        .catch((err) => console.log(err));
};

exports.postOrder = (req, res, next) => {
    req.user.addOrder()
        .then((result) => {
            res.redirect('/');
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.getOrders = (req, res, next) => {
    req.user
        .getOrders()
        .then((orders) => {
            // console.log("Orders:", orders);
            res.render('shop/orders', {
                path: '/orders',
                pageTitle: 'Your Orders',
                orders: orders,
            });
        })
        .catch((err) => console.log(err));
};
