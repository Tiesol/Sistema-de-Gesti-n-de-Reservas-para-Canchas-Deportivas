module.exports = (app, db) => {

    const isClient = (req, res, next) => {
        if (req.session.userlog && req.session.userlog.role === 'user') {
            next();
        } else {
            res.redirect('/login'); 
        }
    }

    app.use('/clients', isClient)

    app.get('/clients/fields', async (req, res) => {
        const fields = await db.Field.findAll();
        res.render('fields/list-fields', { fields });
    });

    app.get('/clients/field', (req, res) => {
        res.render('client/field-details');
    });

    app.get('/clients/form-reservations', (req, res) => {
        res.render('client/form-reservation');
    });

    app.get('/clients/reservations', (req, res) => {
        res.render('client/my-reservations');
    });

    app.get('/clients/logout', (req, res) => {
        req.session.destroy();
        res.redirect('/login');
    });
    
};