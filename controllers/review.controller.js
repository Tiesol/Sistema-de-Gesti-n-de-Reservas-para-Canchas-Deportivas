module.exports = (app, db) => {
    app.post('/clients/reservations/:id/review', async (req, res) => {
        const reservationId = req.params.id;
        const userId = req.session.userlog.id;
        const { rating, comment } = req.body;

        try {
            const reservation = await db.Reservation.findOne({
                where: { id: reservationId, userId: userId, status: 'completed' },
                include: [{ model: db.TimeSlot, as: 'timeSlot' }]
            });

            if (reservation && reservation.timeSlot) {
                await db.Review.create({
                    rating: parseInt(rating),
                    comment: comment ? comment.trim() : '',
                    userId: userId,
                    fieldId: reservation.timeSlot.fieldId,
                    reservationId: reservation.id
                });
            }

            res.redirect('/clients/reservations');
        } catch (error) {
            console.log('Error creando reseña:', error);
            res.redirect('/clients/reservations');
        }
    });

    app.post('/admin/reviews/:id/delete', async (req, res) => {
        const { id } = req.params;

        try {
            const review = await db.Review.findByPk(id);
            if (!review) {
                return res.redirect('/admin/fields');
            }

            const fieldId = review.fieldId; 
            
            await review.destroy();
            
            res.redirect(`/admin/fields/${fieldId}/reviews`); 

        } catch (error) {
            console.log('Error borrando reseña:', error);
            res.redirect('/admin/fields');
        }
    });
}