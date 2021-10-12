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
    req.user
        .createProduct({
            title: title,
            imageUrl: imageUrl,
            description: description,
            price: price,
        })
        .then((result) => {
            console.log(result);
            res.redirect('/admin/products');
        })
        .catch((err) => {
            console.log(err);
            res.redirect('/');
        });
};

exports.postEditProduct = (req, res, next) => {
    const id = req.body.productId;
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const price = req.body.price;
    Product.findByPk(id)
        .then((product) => {
            product.title = title;
            product.imageUrl = imageUrl;
            product.description = description;
            product.price = price;
            return product.save();
        })
        .then(() => {
            res.redirect('/admin/products');
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.getEditProduct = (req, res, next) => {
    const productId = req.params.productId;
    req.user
        .getProducts({ where: { id: productId } })
        .then((products) => {
            if (products) {
                const product = products[0];
                res.render('admin/edit-product', {
                    pageTitle: 'Edit Product ' + products.title,
                    path: '/admin/edit-product',
                    product: products,
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
    req.user
    .getProducts()
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
    req.user.getProducts({where: {id: productId}})
        .then((product) => {
            return product.destroy();
        })
        .then(() => {
            res.redirect('/admin/products');
        })
        .catch((err) => {
            console.log(err);
            res.redirect('/');
        });
};
