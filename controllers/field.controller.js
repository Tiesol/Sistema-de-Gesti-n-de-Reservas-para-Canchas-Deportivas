module.exports = (app, db) => {
    app.get('/admin/fields', async (req, res) => {
        const fields = await db.Field.findAll({
            include: [{ model: db.FieldType, as: 'fieldType' }]
        });
        res.render('fields/list-fields', { fields });
    });

    app.get('/admin/fields/create', async (req, res) => {
        const fieldTypes = await db.FieldType.findAll();
        res.render('admin/form-field', { fieldTypes, field: null });
    });

    app.post('/admin/fields/create', async (req, res) => {
        let { name, pricePerHour, fieldTypeId } = req.body;

        try {

            name = name ? name.trim() : '';
            pricePerHour = pricePerHour ? parseFloat(pricePerHour) : null;
            fieldTypeId = fieldTypeId ? parseInt(fieldTypeId) : null;

            if (!name || !pricePerHour || !fieldTypeId) {
                const fieldTypes = await db.FieldType.findAll();
                return res.render('admin/form-field', {
                    fieldTypes,
                    field: null,
                    error: 'Todos los campos son obligatorios'
                });
            }

            await db.Field.create({
                name,
                pricePerHour,
                fieldTypeId
            });

            res.redirect('/admin/fields');

        } catch (error) {
            console.log("Error al crear cancha:", error);
            const fieldTypes = await db.FieldType.findAll();
            return res.render('admin/form-field', {
                fieldTypes,
                field: null,
                error: 'Error al crear la cancha'
            });
        }
    });

    app.get('/admin/fields/:id/edit', async (req, res) => {
        const { id } = req.params;
        try {
            const field = await db.Field.findByPk(id);
            const fieldTypes = await db.FieldType.findAll();

            if (field) {
                res.render('admin/form-field', { fieldTypes, field });
            } else {
                res.redirect('/admin/fields');
            }
        } catch (error) {
            console.log("Error al cargar edit de cancha:", error);
            res.redirect('/admin/fields');
        }
    });

    app.post('/admin/fields/:id/edit', async (req, res) => {
        const { id } = req.params;
        let { name, pricePerHour, fieldTypeId, status } = req.body;

        try {
            name = name ? name.trim() : '';
            pricePerHour = pricePerHour ? parseFloat(pricePerHour) : null;
            fieldTypeId = fieldTypeId ? parseInt(fieldTypeId) : null;

            if (!name || !pricePerHour || !fieldTypeId) {
                const field = await db.Field.findByPk(id);
                const fieldTypes = await db.FieldType.findAll();
                return res.render('admin/form-field', {
                    fieldTypes,
                    field,
                    error: 'Todos los campos son obligatorios'
                });
            }

            const fieldToUpdate = await db.Field.findByPk(id);
            if (fieldToUpdate) {
                fieldToUpdate.name = name;
                fieldToUpdate.pricePerHour = pricePerHour;
                fieldToUpdate.fieldTypeId = fieldTypeId;

                if (status === 'available' || status === 'unavailable') {
                    fieldToUpdate.status = status;
                }

                await fieldToUpdate.save();
            }

            res.redirect('/admin/fields');

        } catch (error) {
            console.log("Error al editar cancha:", error);
            res.redirect('/admin/fields');
        }
    });

    app.post('/admin/fields/:id/delete', async (req, res) => {
        const { id } = req.params;

        try {
            const field = await db.Field.findByPk(id);

            if (field) {
                await field.destroy();
            }

            res.redirect('/admin/fields');

        } catch (error) {
            console.log("Error al borrar:", error);
            res.redirect('/admin/fields');
        }
    });

    app.get('/admin/fields/:id/reviews', async (req, res) => {
        const { id } = req.params;
        try {
            const field = await db.Field.findByPk(id, {
                include: [
                    {
                        model: db.Review,
                        as: 'reviews',
                        include: [{ model: db.User, as: 'user', attributes: ['name'] }]
                    }
                ],
                order: [[{ model: db.Review, as: 'reviews' }, 'createdAt', 'DESC']]
            });

            if (!field) {
                return res.redirect('/admin/fields');
            }

            res.render('admin/field-reviews', { field, reviews: field.reviews || [] });
        } catch (error) {
            console.log("Error cargando reseñas de la cancha:", error);
            res.redirect('/admin/fields');
        }
    });

}