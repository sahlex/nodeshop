require('dotenv').config();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const sgMail = require('@sendgrid/mail');
const { validationResult } = require('express-validator/check');

// sendgrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.getLogin = (req, res, next) => {
    const flashError = req.flash('error');
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: '',
        validationErrors: []
    });
};

const renderLogin422 = (req, res, errors, errorMessage) => {
    return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            oldInput: {
                email: req.body.email,
                password: req.body.password,
            },
            errorMessage: errorMessage,
            validationErrors: errors,
        });
}

exports.postLogin = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors.array());
        return renderLogin422(req, res, errors.array(), '');
    }

    User.findOne({ email: req.body.email })
        .then((user) => {
            if (!user) {
                return renderLogin422(req, res, [], 'Invalid user credentials');
            }
            const password = req.body.password;
            return bcrypt.compare(password, user.password).then((doMatch) => {
                if (doMatch) {
                    req.session.userId = user._id;
                    req.session.isLoggedIn = true;
                    return req.session.save((err) => {
                        if (err) {
                            console.log(err);
                        }
                        res.redirect('/');
                    });
                }

                renderLogin422(req, res, [], 'Invalid user credentials');
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
};

exports.getSignup = (req, res, next) => {
    const flashError = req.flash('error');
    const message = flashError.length > 0 ? flashError[0] : null;
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        validationErrors: [],
    });
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log("ValidationErrors:", errors.array());
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            oldInput: {
                email: email,
                password: password,
                confirmPassword: req.body.confirmPassword,
            },
            validationErrors: errors.array(),
        });
    }

    return bcrypt
        .hash(password, 12)
        .then((pwhash) => {
            const newUser = new User({
                email: email,
                password: pwhash,
                cart: { items: [] },
            });
            return newUser.save();
        })
        .then((newUser) => {
            // success
            res.redirect('/login');
            const msg = {
                to: email, // Change to your recipient
                from: 'sahlex@gmail.com', // Change to your verified sender
                subject: 'Nodeshop registration',
                text: 'Successfully subscribed to NodeShop',
                html: '<strong>Successfully subscribed to NodeShop</strong>',
                template_id: 'd-7a90068bc2354e67932efe8860ee9bc5',
                dynamic_template_data: {},
            };
            return sgMail.send(msg);
        })
        .catch((err) => {
            console.log(err);
            res.redirect('/signup');
        });
};


exports.logout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        }
        res.redirect('/');
    });
};

exports.getReset = (req, res, next) => {
    const flashError = req.flash('error');
    const message = flashError.length > 0 ? flashError[0] : null;
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: message,
    });
};

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            return res.redirect('/reset');
        }

        const token = buffer.toString('hex');
        let theUser;

        User.findOne({ email: req.body.email }).then((user) => {
            if (!user) {
                req.flash('error', 'No account with that email found');
                return res.redirect('/reset');
            }
            theUser = user;
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000;
            return user
                .save()
                .then((result) => {
                    res.redirect('/');
                    const msg = {
                        to: req.body.email,
                        from: 'sahlex@gmail.com', // Change to your verified sender
                        subject: 'Password reset',
                        html: `<p>You requested a password reset</p>
                        <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.<p>`,
                        template_id: 'd-92a49f009f434ffd8a4569a86f9d869e',
                        dynamic_template_data: {
                            resetLinkUrl: `http://localhost:3000/reset/${token}`,
                            resetTokenExpiration: theUser.resetTokenExpiration,
                        },
                    };
                    return sgMail.send(msg);
                })
                .catch((err) => {
                    const error = new Error(err);
                    error.httpStatusCode = 500;
                    next(error);
                });
        });
    });
};

exports.getResetPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({
        resetToken: token,
        resetTokenExpiration: { $gt: Date.now() },
    })
        .then((user) => {
            if (!user) {
                req.flash('error', 'Invalid password reset token');
                return res.redirect('/reset');
            }

            const flashError = req.flash('error');
            const message = flashError.length > 0 ? flashError[0] : null;
            return res.render('auth/reset-password', {
                path: '/reset-password',
                pageTitle: 'Reset Password',
                userId: user._id.toString(),
                passwordToken: token,
                errorMessage: message,
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
};

exports.postResetPassword = (req, res, next) => {
    const userId = req.body.userId;
    const newPassword = req.body.password;
    const token = req.body.passwordToken;
    let theUser;
    User.findOne({
        resetToken: token,
        resetTokenExpiration: { $gt: Date.now() },
        _id: userId,
    })
        .then((user) => {
            if (!user) {
                req.flash('error', 'Invalid password reset token');
                return res.redirect('/reset');
            }
            theUser = user;
            return bcrypt.hash(newPassword, 12);
        })
        .then((pwhash) => {
            theUser.password = pwhash;
            theUser.resetToken = undefined;
            theUser.resetTokenExpiration = undefined;
            return theUser.save();
        })
        .then((result) => {
            res.redirect('/login');
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
};
