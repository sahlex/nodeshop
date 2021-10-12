const Product = require('../models/product');
const Order = require('../models/order');

exports.getProducts = (req, res) => {
    Product.findAll()
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

    Product.findByPk(prodId)
        .then((product) => {
            console.log(row);
            res.render('shop/product-detail', {
                pageTitle: rroduct.title,
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
    Product.findAll()
        .then((products) => {
            res.render('shop/index', {
                prods: products,
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
    req.user
        .getCart()
        .then((cart) => {
            return cart.getProducts();
        })
        .then((products) => {
            res.render('shop/cart', {
                path: '/cart',
                pageTitle: 'Your Cart',
                prods: products,
            });
        })
        .catch((err) => console.log(err));
};

exports.postCart = (req, res) => {
    const prodId = req.body.productId;
    let theCart;
    let newQuantity = 1;

    req.user
        .getCart()
        .then((cart) => {
            theCart = cart;
            return cart.getProducts({ where: { id: prodId } });
        })
        .then((products) => {
            let product;
            if (products.length > 0) {
                product = products[0];
            }

            if (product) {
                newQuantity = product.cartItem.quantity + 1;
                return product;
            } else {
                return Product.findByPk(prodId)
                    .then((product) => {
                        return product;
                    })
                    .catch((err) => console.log(err));
            }
        })
        .then((product) => {
            return theCart.addProduct(product, {
                through: { quantity: newQuantity },
            });
        })
        .then(() => {
            res.redirect('/cart');
        })
        .catch((err) => console.log(err));
};

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    req.user
        .getCart()
        .then((cart) => {
            return cart.getProducts({ where: { id: prodId } });
        })
        .then((products) => {
            const product = products[0];
            return product.cartItem.destroy();
        })
        .then((result) => {
            res.redirect('/cart');
        })
        .catch((err) => console.log(err));
};

exports.postOrder = (req, res, next) => {
    let theCart;

    req.user
        .getCart()
        .then((cart) => {
            theCart = cart;
            return cart.getProducts();
        })
        .then((products) => {
            return req.user
                .createOrder()
                .then((order) => {
                    return order.addProducts(
                        products.map((product) => {
                            product.orderItem = {
                                quantity: product.cartItem.quantity,
                            };
                            return product;
                        })
                    );
                })
                .catch((err) => {
                    console.log(err);
                });
        })
        .then((result) => {
            // clear cart
            theCart.setProducts(null);
        })
        .then((result) => {
            res.redirect('/orders');
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.getOrders = (req, res, next) => {
    req.user
        .getOrders({include: ['products']})
        .then((orders) => {
            // console.log(orders);
            res.render('shop/orders', {
                path: '/orders',
                pageTitle: 'Your Orders',
                orders: orders,
            });
        })
        .catch((err) => console.log(err));
};
