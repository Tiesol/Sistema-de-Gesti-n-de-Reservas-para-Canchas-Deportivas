module.exports = (app, db) => {

    const getDefaultUser = async () => {
        let user = await db.User.findOne();
        if (!user) {
            user = await db.User.create({
                name: 'Cliente',
                email: 'cliente@example.com',
                password: '1234',
                role: 'user'
            });
        }
        return user;
    };

    app.get('/', (req, res) => res.redirect('/cancha'));

    app.get('/login', (req, res) => {
        res.render('auth/form-login');
    });

    app.post('/login', async (req, res) => {
        const { email, password } = req.body;
        const user = await db.User.findOne({ where: { email } });

        if (!user) {
            return res.render('auth/form-login', { error: 'Usuario no encontrado' });
        }

        if (user.password !== password) {
            return res.render('auth/form-login', { error: 'Contraseña incorrecta' });
        }

        return res.render('auth/form-login', { success: `Bienvenido ${user.name}` });
    });

    app.get('/register', (req, res) => {
        res.render('auth/form-register');
    });

    app.post('/register', async (req, res) => {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.render('auth/form-register', { error: 'Todos los campos son obligatorios' });
        }

        const existingUser = await db.User.findOne({ where: { email } });
        if (existingUser) {
            return res.render('auth/form-register', { error: 'El email ya está en uso' });
        }

        await db.User.create({ name, email, password, role });

        return res.render('auth/form-register', { success: 'Usuario registrado con éxito. Ahora inicia sesión.' });
    });

}    