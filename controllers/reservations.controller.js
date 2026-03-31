module.exports = (app, db) => {

    const { Op } = require('sequelize');

    // aca abre la pantalla donde el cliente confirma que quiere ese horario de esa cancha
    app.get('/clients/fields/:fieldId/reserve/:timeSlotId', async (req, res) => {
        const { fieldId, timeSlotId } = req.params;

        try {
            // traigo la cancha con el tipo para mostrar nombre y datos en form-reservation.ejs
            const field = await db.Field.findByPk(fieldId, {
                include: [{ model: db.FieldType, as: 'fieldType' }]
            });
            // el horario tiene que ser de esa cancha, el id correcto, y todavia libre (isAvailable true)
            const timeSlot = await db.TimeSlot.findOne({
                where: {
                    id: timeSlotId,
                    fieldId,
                    isAvailable: true
                }
            });

            if (!field || !timeSlot) {
                // si ya no esta disponible, lo mando al listado de la cancha
                return res.redirect(`/clients/fields/${fieldId}`);
            }

            res.render('client/form-reservation', { field, timeSlot });
        } catch (error) {
            console.log('Error abriendo formulario de reserva:', error);
            res.redirect(`/clients/fields/${fieldId}`);
        }
    });

    // y aca cuando apreta confirmar en el formulario, aca se crea la fila en Reservation y se ocupa el TimeSlot
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

// mira tieso: chequeo que el horario no se CRUCE con una reserva que ya existe en esa misma cancha. en la misma cancha y misma fecha (por si el admin dejo dos slots que se pisan)
            // Op.ne = el id del timeslot NO es el que estoy reservando (otro slot distinto)
            const conflictReservation = await db.Reservation.findOne({
                where: {
                    status: 'confirmed'
                },
                include: [{
                    model: db.TimeSlot,
                    as: 'timeSlot',
                    required: true,
                    where: {
                        fieldId: parseInt(fieldId),
                        date: timeSlot.date,
                        id: { [Op.ne]: timeSlot.id },
                        [Op.and]: [
                            { startTime: { [Op.lt]: timeSlot.endTime } },
                            { endTime: { [Op.gt]: timeSlot.startTime } }
                        ]
                    }
                }]
            });

            if (conflictReservation) {
                // ya hay alguien con reserva que choca, no dejo duplicar el mismo rango horario
                return res.redirect(`/clients/fields/${fieldId}`);
            }

            // aca huevada: creo la reserva confirmada y marco el slot como no disponible
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

    // GET: lista todas las reservas del usuario logueado (historial)
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

    // POST: cancelar una reserva que siga confirmada; la paso a cancelled y libero el horario otra vez
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
};
