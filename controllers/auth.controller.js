module.exports = (app, db) => {

    app.get('/login', (req, res) => {
        res.render('auth/form-login');
    });

    app.get('/register', (req, res) => {
        res.render('auth/form-register');
    });
}    