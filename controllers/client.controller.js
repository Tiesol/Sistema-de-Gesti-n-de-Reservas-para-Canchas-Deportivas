module.exports = (app, db) => {
    app.get('/clients/home', async (req, res) => {
        const fields = await db.Field.findAll();
        res.render('client/home', { fields});
    });
};