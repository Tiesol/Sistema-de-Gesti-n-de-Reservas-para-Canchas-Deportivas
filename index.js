const express = require('express');
const app = express();
const port = 3000;
const db = require('./models');
const bodyParser = require('body-parser');
const expressSession = require('express-session');

app.use(expressSession({
    secret: 'otraspedrin',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use((req, res, next) => {
    res.locals.userlog = req.session.userlog || null;
    next();
});

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

require('./controllers')(app, db);

// Para habilitar la BD
db.sequelize.sync({
    //force: true // drop tables and recreate
}).then(() => {
    console.log("db resync");
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})