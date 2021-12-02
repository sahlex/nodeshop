const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const app = express();
const User = require('./models/user');
const session = require('express-session');
const SessionStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const multer = require('multer');

const MONGODB_URI =
    'mongodb://shopuser:secret@s-doc-app-903.haba.int/shopdb?retryWrites=true';

const store = new SessionStore({
    uri: MONGODB_URI,
    collection: 'sessions',
});
const csrfProtection = csrf();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const noCsrfRoutes = require('./routes/no-csrf');
const errorController = require('./controllers/error');

const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().getTime() + '-' + file.originalname);
    },
});
const fileFilter = (req, file, cb) => {
    cb(null,  ['image/jpg', 'image/png', 'image/jpeg'].indexOf(file.mimetype) >= 0);
};

app.use(express.urlencoded({ extended: true }));
app.use(
    multer({ storage: diskStorage, fileFilter: fileFilter }).single('image')
);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(
    session({
        secret: 'myS3cr3t',
        resave: true,
        saveUninitialized: false,
        store: store,
    })
);
// routes needed without CSRF protection
app.use(noCsrfRoutes.routes);
app.use(csrfProtection);
// flash messages
app.use(flash());

app.use((req, res, next) => {
    if (!req.session.userId) {
        return next();
    }
    User.findById(req.session.userId)
        .then((user) => {
            if (!user) {
                return next();
            }
            req.user = user;
            next();
        })
        .catch((err) => {
            const error = new Error(err);
            error.htmlStatusCode = 500;
            next(error);
        });
});

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use('/admin', adminRoutes.routes);
app.use(shopRoutes.routes);
app.use(authRoutes.routes);

app.get('/500', errorController.send500Page);
app.use(errorController.send404Page);

app.use((error, req, res, next) => {
    console.log('Error handler: ', error);
    res.redirect('/500');
});

mongoose
    .connect(MONGODB_URI)
    .then((result) => {
        console.log('Connected!');
        app.listen(3000);
    })
    .catch((err) => console.log(err));
