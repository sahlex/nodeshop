const { Double } = require('bson');
const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
    });
};

exports.postAddProduct = (req, res, next) => {
    const userId = req.user._id;
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const price = +req.body.price;

    const product = new Product(title, price, description, imageUrl, userId);
    product.save().then((result) => {
        res.redirect('/admin/products');
    });
};

exports.postEditProduct = (req, res, next) => {
    const userId = req.user._id;
    const id = req.body.productId;
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const price = +req.body.price;
    const product = new Product(title, price, description, imageUrl, userId, id);
    product
        .save()
        .then((result) => {
            res.redirect('/admin/products');
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.getEditProduct = (req, res, next) => {
    const productId = req.params.productId;
    Product.findById(productId)
        .then((product) => {
            if (product) {
                res.render('admin/edit-product', {
                    pageTitle: 'Edit Product ' + product.title,
                    path: '/admin/edit-product',
                    product: product,
                });
            } else {
                res.redirect('/');
            }
        })
        .catch((err) => {
            console.log(err);
            res.redirect('/');
        });
};

exports.getAdminProducts = (req, res) => {
    Product.fetchAll()
        .then((products) => {
            res.render('admin/products', {
                pageTitle: 'Admin Products',
                prods: products,
                path: '/admin/products',
            });
        })
        .catch((err) => {
            console.log(err);
            res.redirect('/');
        });
};


exports.deleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    Product.deleteById(productId)
        .then(() => {
            res.redirect('/admin/products');
        })
        .catch((err) => {
            console.log(err);
            res.redirect('/');
        });
}; 
