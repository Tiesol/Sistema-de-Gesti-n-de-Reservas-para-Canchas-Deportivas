module.exports = (app, db) => {
    const { Op } = require('sequelize');

    const timeToMinutes = (t) => {
        if (!t) return NaN;
        const parts = String(t).split(':');
        const h = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        if (Number.isNaN(h) || Number.isNaN(m)) return NaN;
        return h * 60 + m;
    };

    app.get('/admin/fields/:fieldId/timeslots', async (req, res) => {
        const { fieldId } = req.params;
        try {
            const field = await db.Field.findByPk(fieldId);
            
            if (!field) return res.redirect('/admin/fields');

            const timeSlots = await db.TimeSlot.findAll({ 
                where: { fieldId: fieldId,
                        isAvailable: true
                 },
                order: [
                    ['date', 'ASC'], 
                    ['startTime', 'ASC']
                ]
            });

            let error = null;
            if (req.query.overlap === '1') {
                error = 'opa ya existe ese horario en esta cancha';
            }

            res.render('admin/list-timeslots', { field, timeSlots, error });
        } catch (error) {
            console.log("Error cargando horarios:", error);
            res.redirect('/admin/fields');
        }
    });

    app.post('/admin/fields/:fieldId/timeslots/create', async (req, res) => {
        const { fieldId } = req.params;
        const { date, startTime, endTime } = req.body;

        try {
            if (date && startTime && endTime) {
                const startMinutes = timeToMinutes(startTime);
                const endMinutes = timeToMinutes(endTime);
                if (Number.isNaN(startMinutes) || Number.isNaN(endMinutes) || endMinutes <= startMinutes) {
                    return res.redirect(`/admin/fields/${fieldId}/timeslots`);
                }

             
                const conflict = await db.TimeSlot.findOne({
                    where: {
                        fieldId: parseInt(fieldId),
                        date,
                        [Op.and]: [
                            { startTime: { [Op.lt]: endTime } },
                            { endTime: { [Op.gt]: startTime } }
                        ]
                    }
                });

                if (conflict) {
                    return res.redirect(`/admin/fields/${fieldId}/timeslots?overlap=1`);
                }

                await db.TimeSlot.create({
                    date: date,
                    startTime: startTime,
                    endTime: endTime,
                    fieldId: parseInt(fieldId) 
                });
            }
            res.redirect(`/admin/fields/${fieldId}/timeslots`);
        } catch (error) {
            console.log("Error creando horario:", error);
            res.redirect(`/admin/fields/${fieldId}/timeslots`);
        }
    });

    app.post('/admin/fields/:fieldId/timeslots/:id/edit', async (req, res) => {
        const { fieldId, id } = req.params;
        const { date, startTime, endTime } = req.body;

        try {
            const timeSlot = await db.TimeSlot.findByPk(id);
            if (timeSlot && date && startTime && endTime) {
                const startMinutes = timeToMinutes(startTime);
                const endMinutes = timeToMinutes(endTime);
                if (Number.isNaN(startMinutes) || Number.isNaN(endMinutes) || endMinutes <= startMinutes) {
                    return res.redirect(`/admin/fields/${fieldId}/timeslots`);
                }

               
                const conflict = await db.TimeSlot.findOne({
                    where: {
                        fieldId: parseInt(fieldId),
                        date,
                        id: { [Op.ne]: id },
                        [Op.and]: [
                            { startTime: { [Op.lt]: endTime } },
                            { endTime: { [Op.gt]: startTime } }
                        ]
                    }
                });

                if (conflict) {
                    return res.redirect(`/admin/fields/${fieldId}/timeslots?overlap=1`);
                }

                timeSlot.date = date;
                timeSlot.startTime = startTime;
                timeSlot.endTime = endTime;
                await timeSlot.save();
            }
            res.redirect(`/admin/fields/${fieldId}/timeslots`);
        } catch (error) {
            console.log("Error editando horario:", error);
            res.redirect(`/admin/fields/${fieldId}/timeslots`);
        }
    });

    app.post('/admin/fields/:fieldId/timeslots/:id/delete', async (req, res) => {
        const { fieldId, id } = req.params;

        try {
            const timeSlot = await db.TimeSlot.findByPk(id);
            if (timeSlot) {
                await timeSlot.destroy();
            }
            res.redirect(`/admin/fields/${fieldId}/timeslots`);
        } catch (error) {
            console.log("Error borrando horario:", error);
            res.redirect(`/admin/fields/${fieldId}/timeslots`);
        }
    });

};