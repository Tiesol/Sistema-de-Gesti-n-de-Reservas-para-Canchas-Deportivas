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
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.render('auth/form-login', { error: 'Contraseña incorrecta' });
        }

        req.session.userlog = {
            id : user.id,
            name: user.name,
            role: user.role,
        };

        return res.redirect('/clients/home');
    });

    app.get('/register', (req, res) => {
        res.render('auth/form-register');
    });

    app.post('/register', async (req, res) => {
        let { name, email, password } = req.body;

        try {

            name = name ? name.trim() : '';
            email = email ? email.trim().toLowerCase() : '';
            password = password ? password.trim() : '';

            if (!name || !email || !password) {
                return res.render('auth/form-register', { error: 'Todos los campos son obligatorios' });
            }

            if (name.length <= 3) {
                return res.render('auth/form-register', { error: 'El nombre debe tener al menos 3 caracteres' });
            }

            const validEmail = email.match(
                /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );

            if (!validEmail) {
                return res.render('auth/form-register', { error: 'El correo no es válido' });
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
            return res.render('auth/form-register', { error: 'Error al registrar usuario' });
        }
    });

    app.get('/clients/logout', (req, res) => {
        req.session.destroy();
        res.redirect('/login');
    });
}