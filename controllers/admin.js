const Product = require('../models/product');
const { validationResult } = require('express-validator/check');
const fileHelper = require('../util/file');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        validationErrors: [],
    });
};

exports.postAddProduct = (req, res, next) => {
    const errors = validationResult(req);
    const title = req.body.title;
    const description = req.body.description;
    const price = +req.body.price;

    // file has wrong type
    if (!req.file) {
        console.log(errors);
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            validationErrors: errors.array(),
            errorMessage: 'Unrecognized image format',
            product: {
                title: title,
                description: description,
                price: price,
            },
        });
    }
    const image = req.file.filename;

    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            validationErrors: errors.array(),
            product: {
                title: title,
                image: image,
                description: description,
                price: price,
            },
        });
    }

    console.log('Image:', image);
    const product = new Product({
        title: title,
        description: description,
        image: req.file.path,
        price: price,
        userId: req.user,
    });

    product
        .save()
        .then((result) => {
            res.redirect('/admin/products');
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
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
                    validationErrors: [],
                });
            } else {
                res.redirect('/');
            }
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
};

exports.postEditProduct = (req, res, next) => {
    const id = req.body.productId;
    const title = req.body.title;
    const description = req.body.description;
    const price = req.body.price;
    const image = req.file;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            validationErrors: errors.array(),
            product: {
                _id: id,
                title: title,
                description: description,
                price: price,
            },
        });
    }

    Product.findById(id)
        .then((product) => {
            if (product.userId.toString() !== req.user._id.toString()) {
                return res.redirect('/');
            }
            product.title = title;
            product.description = description;
            product.price = price;
            if (image) {
                fileHelper.deleteFile(product.image);
                product.image = image.path;
            }
            product.save().then((result) => {
                res.redirect('/admin/products');
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
};

exports.getAdminProducts = (req, res) => {
    Product.find({ userId: req.user._id })
        //Product.find()
        .then((products) => {
            res.render('admin/products', {
                pageTitle: 'Admin Products',
                prods: products,
                path: '/admin/products',
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
};

exports.deleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    Product.findById(productId)
        .then((product) => {
            if (!product) {
                return next(new Error('no such product'));
            }
            fileHelper.deleteFile(product.image);
            return Product.deleteOne({ _id: productId, userId: req.user });
        })
        .then(() => {
            res.redirect('/admin/products');
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
};
