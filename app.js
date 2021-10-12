const express = require('express');
const path = require('path');
const sequelize = require('./util/database');
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/error');

const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');
const admin = require('./routes/admin');
const { openDelimiter } = require('ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findByPk(1)
        .then((user) => {
            req.user = user;
            next();
        })
        .catch((err) => {
            console.log(err);
        });
});

app.use('/admin', adminRoutes.routes);
app.use(shopRoutes.routes);

app.use(errorController.send404Page);

Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });
Product.belongsToMany(Order, { through: OrderItem });

sequelize
   // .sync({force: true})
    .sync()
    .then((result) => {
        // console.log(result);
        return User.findByPk(1);
    })
    .then((user) => {
        if (!user) {
            return User.create({
                id: 1,
                name: 'admin',
                email: 'some@mail.domain',
            });
        }
        return user;
    })
    .then((user) => {
        user.getCart()
            .then((cart) => {
                if (!cart) {
                    return user.createCart();
                }
            })
            .catch((err) => {
                console.log(err);
            });
    })
    .then(() => {
        app.listen(3000);
    })
    .catch((err) => {
        console.log(err);
    });
