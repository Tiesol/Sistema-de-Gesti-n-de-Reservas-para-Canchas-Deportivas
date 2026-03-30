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
                    { model: db.TimeSlot, as: 'timeSlots', where: { isAvailable: true }, required: false }
                ]
            });

            if (!field) {
                return res.redirect('/clients/fields');
            }

            res.render('client/field-details', {
                field,
                timeSlots: field.timeSlots || []
            });
        } catch (error) {
            console.log('Error cargando detalles de cancha:', error);
            res.redirect('/clients/fields');
        }
    });

    app.get('/clients/fields/:fieldId/reserve/:timeSlotId', async (req, res) => {
        const { fieldId, timeSlotId } = req.params;

        try {
            const field = await db.Field.findByPk(fieldId, {
                include: [{ model: db.FieldType, as: 'fieldType' }]
            });
            const timeSlot = await db.TimeSlot.findOne({
                where: {
                    id: timeSlotId,
                    fieldId,
                    isAvailable: true
                }
            });

            if (!field || !timeSlot) {
                return res.redirect(`/clients/fields/${fieldId}`);
            }

            res.render('client/form-reservation', { field, timeSlot });
        } catch (error) {
            console.log('Error abriendo formulario de reserva:', error);
            res.redirect(`/clients/fields/${fieldId}`);
        }
    });

    app.post('/clients/fields/:fieldId/reserve/:timeSlotId', async (req, res) => {
        const { fieldId, timeSlotId } = req.params;
        const userId = req.session.userlog.id;

        try {
            const timeSlot = await db.TimeSlot.findOne({
                where: {
                    id: timeSlotId,
                    fieldId,
                    isAvailable: true
                }
            });

            if (!timeSlot) {
                return res.redirect(`/clients/fields/${fieldId}`);
            }

            await db.Reservation.create({
                userId,
                timeSlotId: timeSlot.id,
                status: 'confirmed'
            });

            timeSlot.isAvailable = false;
            await timeSlot.save();

            res.redirect('/clients/reservations');
        } catch (error) {
            console.log('Error creando reserva:', error);
            res.redirect(`/clients/fields/${fieldId}`);
        }
    });

    app.get('/clients/reservations', async (req, res) => {
        const userId = req.session.userlog.id;

        try {
            const reservations = await db.Reservation.findAll({
                where: { userId },
                include: [{
                    model: db.TimeSlot,
                    as: 'timeSlot',
                    include: [{ model: db.Field, as: 'field', include: [{ model: db.FieldType, as: 'fieldType' }] }]
                }],
                order: [['createdAt', 'DESC']]
            });

            res.render('client/my-reservations', { reservations });
        } catch (error) {
            console.log('Error cargando reservas:', error);
            res.render('client/my-reservations', { reservations: [] });
        }
    });

    app.post('/clients/reservations/:id/cancel', async (req, res) => {
        const { id } = req.params;
        const userId = req.session.userlog.id;

        try {
            const reservation = await db.Reservation.findOne({
                where: {
                    id,
                    userId,
                    status: 'confirmed'
                },
                include: [{ model: db.TimeSlot, as: 'timeSlot' }]
            });

            if (reservation) {
                reservation.status = 'cancelled';
                await reservation.save();

                if (reservation.timeSlot) {
                    reservation.timeSlot.isAvailable = true;
                    await reservation.timeSlot.save();
                }
            }
        } catch (error) {
            console.log('Error cancelando reserva:', error);
        }

        res.redirect('/clients/reservations');
    });

    app.get('/clients/field', (req, res) => {
        res.redirect('/clients/fields');
    });
};