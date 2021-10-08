const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
    });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const price = req.body.price;
    const product = new Product(null, title, imageUrl, description, price);
    product
        .save()
        .then(() => {
            res.redirect('/admin/products');
        })
        .catch((err) => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
    const id = req.body.productId;
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const price = req.body.price;
    const product = new Product(id, title, imageUrl, description, price);
    product
        .save()
        .then(() => {
            res.redirect('/admin/products');
        })
        .catch((err) => console.log(err));
};

exports.getEditProduct = (req, res, next) => {
    const productId = req.params.productId;
    Product.findById(productId)
        .then(([row, fieldData]) => {
            if (row[0]) {
                res.render('admin/edit-product', {
                    pageTitle: 'Edit Product ' + row[0].title,
                    path: '/admin/edit-product',
                    product: row[0],
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

exports.deleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    Product.deleteProductById(productId)
        .then(() => {
            res.redirect('/admin/products');
        })
        .catch((err) => {
            console.log(err);
            res.redirect('/');
        });
};

exports.getAdminProducts = (req, res) => {
    Product.fetchAll()
        .then(([rows, fieldData]) => {
            res.render('admin/products', {
                pageTitle: 'Admin Products',
                prods: rows,
                path: '/admin/products',
            });
        })
        .catch((err) => {
            console.log(err);
            res.redirect('/');
        });
};
