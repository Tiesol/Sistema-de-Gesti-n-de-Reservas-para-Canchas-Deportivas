module.exports = (app, db) => {

    require('./auth.controller')(app, db);

    const isAdmin = (req, res, next) => {
        if (req.session.userlog && req.session.userlog.role === 'admin') {
            next();
        } else {
            res.redirect('/login');
        }
    }

    const isClient = (req, res, next) => {
        if (req.session.userlog && req.session.userlog.role === 'user') {
            next();
        } else {
            res.redirect('/login'); 
        }
    }

    app.use('/clients', isClient)
    app.use('/admin', isAdmin);

    require('./client.controller')(app, db);
    require('./reservations.controller')(app, db);
    require('./admin-reservations.controller')(app, db);
    require('./field.controller')(app, db);
    require('./field-type.controller')(app, db);
    require('./time-slot.controller')(app, db);
    require('./review.controller')(app, db);
}