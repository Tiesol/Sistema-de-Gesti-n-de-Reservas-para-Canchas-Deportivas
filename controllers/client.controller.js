module.exports = (app, db) => {

    app.get('/clients/fields', async (req, res) => {
        const fields = await db.Field.findAll({
            include: [{ model: db.FieldType, as: 'fieldType' }]
        });
        res.render('fields/list-fields', { fields });
    });

    app.get('/clients/fields/:id', async (req, res) => {
        const { id } = req.params;
        try {
            const field = await db.Field.findByPk(id, {
                include: [
                    { model: db.FieldType, as: 'fieldType' },
                    { model: db.TimeSlot, as: 'timeSlots', where: { isAvailable: true }, required: false },
                    { 
                        model: db.Review, 
                        as: 'reviews', 
                        required: false,
                        include: [{ model: db.User, as: 'user', attributes: ['name'] }] 
                    }
                ]
            });

            if (!field) {
                return res.redirect('/clients/fields');
            }

            res.render('client/field-details', {
                field,
                timeSlots: field.timeSlots || [],
                reviews: field.reviews || []
            });
        } catch (error) {
            console.log('Error cargando detalles de cancha:', error);
            res.redirect('/clients/fields');
        }
    });

    app.get('/clients/field', (req, res) => {
        res.redirect('/clients/fields');
    });

};