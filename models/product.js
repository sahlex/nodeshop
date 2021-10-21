const getDb = require('../util/database').getDb;
const mongodb = require('mongodb');

class Product {
    constructor(title, price, description, imageUrl, userId, id) {
        this.title = title;
        this.price = +price;
        this.description = description;
        this.imageUrl = imageUrl;
        this.userId = new mongodb.ObjectId(userId);
        if (id) {
            this._id = new mongodb.ObjectId(id);
        }
    }

    save() {
        const db = getDb();
        if (this._id) {
            // update
            return db
                .collection('products')
                .updateOne({ _id: this._id }, { $set: this });
        } else {
            return db.collection('products').insertOne(this);
        }
    }

    static fetchAll() {
        const db = getDb();
        return db.collection('products').find().toArray();
    }

    static findById(id) {
        const db = getDb();
        return db
            .collection('products')
            .findOne({ _id: new mongodb.ObjectId(id) });
    }

    static deleteById(prodId) {
        const db = getDb();
        return db
            .collection('products')
            .deleteOne({ _id: new mongodb.ObjectId(prodId) });
    }
}

module.exports = Product;
