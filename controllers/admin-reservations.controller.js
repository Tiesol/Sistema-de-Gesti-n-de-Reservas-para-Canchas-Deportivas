module.exports = (app, db) => {
    const marcarCompletadas = async () => {
        try {
            const ahora = new Date();

            const reservasConfirmadas = await db.Reservation.findAll({
                where: { status: 'confirmed' },
                include: [{ model: db.TimeSlot, as: 'timeSlot' }]
            });

            for (let i = 0; i < reservasConfirmadas.length; i++) {
                const r = reservasConfirmadas[i];
                const ts = r.timeSlot;
                if (!ts) continue;

                const dateStr = ts.date instanceof Date ? ts.date.toISOString().slice(0, 10) : String(ts.date);
                const fin = new Date(`${dateStr}T${String(ts.endTime)}`);
                if (Number.isNaN(fin.getTime())) continue;

                if (ahora >= fin) {
                    r.status = 'completed';
                    await r.save();
                }
            }
        } catch (error) {
            console.log('Error marcando completed:', error);
        }
    };

    app.get('/admin/reservations', async (req, res) => {
        try {
            await marcarCompletadas();

            const reservations = await db.Reservation.findAll({
                include: [
                    { model: db.User, as: 'user', attributes: ['name', 'email'] },
                    {
                        model: db.TimeSlot,
                        as: 'timeSlot',
                        include: [
                            {
                                model: db.Field,
                                as: 'field',
                                include: [{ model: db.FieldType, as: 'fieldType' }]
                            }
                        ]
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            res.render('admin/list-reservations', { reservations });
        } catch (error) {
            console.log('Error cargando reservas admin:', error);
            res.render('admin/list-reservations', { reservations: [] });
        }
    });

    app.post('/admin/reservations/:id/status', async (req, res) => {
        const { id } = req.params;
        const { status } = req.body;

        try {
            const reservation = await db.Reservation.findOne({
                where: { id },
                include: [{ model: db.TimeSlot, as: 'timeSlot' }]
            });

            if (reservation) {
                const estadosPermitidos = ['confirmed', 'cancelled', 'completed'];
                if (estadosPermitidos.includes(status)) {
                    reservation.status = status;
                    await reservation.save();

                    if (reservation.timeSlot) {
                        if (status === 'cancelled') {
                            reservation.timeSlot.isAvailable = true;
                        } else {
                            reservation.timeSlot.isAvailable = false;
                        }
                        await reservation.timeSlot.save();
                    }
                }
            }
        } catch (error) {
            console.log('Error cambiando estado reserva:', error);
        }

        res.redirect('/admin/reservations');
    });
};

