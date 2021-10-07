const fs = require('fs');
const path = require('path');

const productsFile = p = path.join(
        path.dirname(require.main.filename),
        'data',
        'products.json'
    );


const getProductsFromFile = (cb) => {
    
    fs.readFile(productsFile, (err, fileContent) => {
        if (err) {
            return cb([]);
        }
        cb(JSON.parse(fileContent));
    });
};

module.exports = class Product {
    constructor(id, title, imageUrl, description, price) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.imageUrl = imageUrl;
        this.price = price;
    }

    save() {
        getProductsFromFile((products) => {
            if (this.id) {
                const existingProductIdx = products.findIndex(p => p.id === this.id);
                products[existingProductIdx] = this;
            } else {
                this.id = Math.random().toString();
                products.push(this);
            }
            fs.writeFile(productsFile, JSON.stringify(products), (err) => {
                console.log(err);
            });
        });
    }

    static fetchAll(cb) {
        getProductsFromFile(cb);
    }

    static findById(id, cb) {
        getProductsFromFile(products => {
            const product = products.find((p) => p.id === id);
            cb(product);
        });
    }

    static deleteProductById(id, cb) {
        getProductsFromFile((products) => {
            const productsToKeep = products.filter((p) => p.id !== id);
            fs.writeFile(productsToKeep, JSON.stringify(products), (err) => {
                if (err) {
                    console.log(err);
                }
                cb(err);
            });
        });
    }
};
