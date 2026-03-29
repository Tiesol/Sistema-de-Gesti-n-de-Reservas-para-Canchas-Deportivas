module.exports = (app, db) => {
    app.get('/admin/fields', async (req, res) => {
        const fields = await db.Field.findAll();
        res.render('fields/list-fields', { fields });
    });

    app.get('/admin/fieldTypes', async (req, res) => {
        const fieldTypes = await db.FieldType.findAll();
        res.render('admin/list-field-types', { fieldTypes });
    });

    app.post('/admin/fieldTypes', async (req, res) => {
        let { name } = req.body;

        try {

            name = name ? name.trim() : '';

            if (!name) {
                const fieldTypes = await db.FieldType.findAll();
                return res.render('admin/list-field-types', {
                    fieldTypes,
                     error: 'El nombre del tipo de cancha es obligatorio' 
                    });
            }

            const fieldType = await db.FieldType.findOne({
                where: {
                    name: name
                }
            });

            if (!fieldType) {
                await db.FieldType.create({
                    name
                })

            } else {
                const fieldTypes = db.FieldType.findAll();
                return res.render('admin/list-field-types', { 
                    fieldTypes, 
                    error: 'Ese tipo de cancha ya existe' 
                });
            }

            res.redirect('/admin/fieldTypes')

        } catch (error) {
            const fieldTypes = db.FieldType.findAll();
            return res.render('admin/list-field-types', { 
                fieldTypes,
                error: 'Error al crear el tipo de cancha' 
            });
        }
    });

    app.post('/admin/fieldTypes/:id/edit', async (req, res) => {
        const { id } = req.params;
        let { name } = req.body;

        try {
            const fieldType = await db.FieldType.findByPk(id);
            
            if (fieldType && name) {
                fieldType.name = name.trim();
                
                await fieldType.save();
            }
            
            res.redirect('/admin/fieldTypes');

        } catch (error) {
            console.log("Error al editar:", error);
            res.redirect('/admin/fieldTypes');
        }
    });

    app.post('/admin/fieldTypes/:id/delete', async (req, res) => {
        const { id } = req.params;

        try {
            const fieldType = await db.FieldType.findByPk(id);
            
            if (fieldType) {
                await fieldType.destroy();
            }
            
            res.redirect('/admin/fieldTypes');

        } catch (error) {
            console.log("Error al borrar:", error);
            res.redirect('/admin/fieldTypes');
        }
    });
}