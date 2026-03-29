module.exports = (app, db) => {

    app.get('/admin/fields/:fieldId/timeslots', async (req, res) => {
        const { fieldId } = req.params;
        try {
            const field = await db.Field.findByPk(fieldId);
            
            if (!field) return res.redirect('/admin/fields');

            const timeSlots = await db.TimeSlot.findAll({ 
                where: { fieldId: fieldId },
                order: [
                    ['date', 'ASC'], 
                    ['startTime', 'ASC']
                ]
            });

            res.render('admin/list-timeslots', { field, timeSlots });
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