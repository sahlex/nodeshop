const express = require('express');
const path = require('path');
const mongo = require('./util/database');
const app = express();
const User = require('./models/user');


app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/error');

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findById('6166f3e5199be49449c428ef')
        .then((user) => {
            req.user = user;
            // console.log(user);
            next();
        })
        .catch((err) => console.log(err));
})

app.use('/admin', adminRoutes.routes);
app.use(shopRoutes.routes);

app.use(errorController.send404Page);

mongo.mongoConnect(() => {
    app.listen(3000);
})


  