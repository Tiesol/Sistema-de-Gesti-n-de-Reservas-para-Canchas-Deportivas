const express = require('express');
const app = express();
const port = 3000;
const db = require('./models');
const bodyParser = require('body-parser');
const expressSession = require('express-session');
const bcrypt = require('bcrypt');

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
}).then(async () => {
    console.log("db resync");
    try {
        const adminEmail = 'admin@gmail.com';

        const existEmail = await db.User.findOne({
            where: { email: adminEmail }
        });

        if (!existEmail) {
            const hashedpassword = await bcrypt.hash('admin123', 10);

            await db.User.create({
                name: 'Super Admin',
                email: adminEmail,
                password: hashedpassword,
                role: 'admin'
            });

            console.log('Admin creado exitosamente')
        } else {
            console.log('El admin ya existe');
        }
    } catch (error) {
        console.error('Error al crear usuario admin:', error);
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})