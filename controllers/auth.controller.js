module.exports = (app, db) => {

    app.get('/login', (req, res) => {
        res.render('auth/form-login');
    });

    app.post('/login', async (req, res) => {
        const { email, password } = req.body;
        const user = await db.user.findOne({
            where: {
                email
            }
        });
        if (!user) {
            return res.render('auth/form-login', { error: 'Usuario no encontrado' });
        }
    });
}