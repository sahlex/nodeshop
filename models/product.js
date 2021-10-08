const db = require('../util/database');

module.exports = class Product {
    constructor(id, title, imageUrl, description, price) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.imageUrl = imageUrl;
        this.price = price;
    }

    save() {
        if (this.id) {
            return db.execute(
                'update products set title = ?, description = ?, imageUrl = ?, price = ? where id = ?',
                [
                    this.title,
                    this.description,
                    this.imageUrl,
                    this.price,
                    this.id,
                ]
            );
        } else {
            return db.execute(
                'insert into products(title, description, imageUrl, price) values (?, ?, ?, ?)',
                [this.title, this.description, this.imageUrl, this.price]
            )
        }
    }

    static fetchAll() {
        return db.execute('select * from products');
    }

    static findById(id) {
        return db.execute('select * from products where id = ?', [id]);
    }

    static deleteProductById(id) {
        return db.execute('delete from products where id = ?', [id]);
    }
};
