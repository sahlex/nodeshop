const fs = require('fs');
const path = require('path');

const cartFile = (p = path.join(
    path.dirname(require.main.filename),
    'data',
    'cart.json'
));

function readCartFromFile(cb) {
    fs.readFile(cartFile, (err, fileContent) => {
        let cart = {
            products: [],
            totalPrice: 0.0,
        };
        if (!err) {
            cart = JSON.parse(fileContent);
            cb(cart)
        }
    })
} 


module.exports = class Cart {
    static addProduct(prod) {
        // fetch cart from file
        readCartFromFile(cart => {
            // analyze cart
            const existingProductIndex = cart.products.findIndex((p) => p.id === prod.id);
            const existingProduct = cart.products[existingProductIndex];
            // add or increase product
            let updatedProduct;
            if (existingProduct) {
                updatedProduct = { ...existingProduct };
                updatedProduct.qty += 1;
                cart.products[existingProductIndex].qty += 1;
            } else {
                updatedProduct = {
                    id: prod.id,
                    qty: 1,
                };
                cart.products.push(updatedProduct);
            }
            cart.totalPrice += +prod.price;

            // write back cart file
            fs.writeFile(cartFile, JSON.stringify(cart), err => {
                console.log(err);
            });
        });
    }

    static deleteProductById(productId, cb) {
        readCartFromFile(cart => {
            productsToKeep = cart.products.filter((p) => p.id !== productId);
            cart.products = productsToKeep;
            // write back cart file
            fs.writeFile(cartFile, JSON.stringify(cart), (err) => {
                if (err) {
                    console.log(err);
                }
                cb(err)
            });
        })
    }
};
