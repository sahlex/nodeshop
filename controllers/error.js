

exports.send404Page = (req, res) => {
    res.status(404).render('404', {
        pageTitle: 'Page Not Found',
        isAuthenticated: req.session.isLoggedIn,
    });
};

exports.send500Page = (req, res) => {
    res.status(500).render('500', {
        pageTitle: 'Error',
        isAuthenticated: req.session.isLoggedIn,
    });
};
