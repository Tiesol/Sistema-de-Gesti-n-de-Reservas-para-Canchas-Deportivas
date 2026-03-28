module.exports = (app, db) => {

    const bcrypt = require('bcrypt');

    app.get('/login', (req, res) => {
        res.render('auth/form-login');
    });

    app.post('/login', async (req, res) => {
        const { email, password } = req.body;
        const user = await db.User.findOne({
            where: {
                email
            }
        });
        if (!user) {
            return res.render('auth/form-login', { error: 'Usuario no encontrado' });
        }
    });

    app.get('/register', (req, res) => {
        res.render('auth/form-register');
    });

    app.post('/register', async (req, res) => {
        const { name, email, password } = req.body;
        try {

            if (!name || !email || !password) {
                return res.render('auth/form-register', { error: 'Todos los campos son obligatorios' });
            }

            if (name.length <= 3) {
                return res.render('auth/form-register', { error: 'El nombre debe tener al menos 3 caracteres' });
            }

            if (password.length < 6) {
                return res.render('auth/form-register', { error: 'La contraseña debe tener al menos 6 caracteres' });
            }

            const existingUser = await db.User.findOne({
                where: {
                    email
                }
            });

            if (existingUser) {
                return res.render('auth/form-register', { error: 'El correo ya está registrado' });
            }

            const hashedpassword = await bcrypt.hash(password, 10);

            await db.User.create({
                name,
                email,
                password: hashedpassword
            });

            return res.redirect('/login');
        } catch (error) {
            console.log(error);
            if (!res.headersSent) {
                return res.render('auth/form-register', { error: 'Error al registrar usuario' });
            }
        }
    });
}