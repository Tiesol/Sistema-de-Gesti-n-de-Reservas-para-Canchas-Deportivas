const { sequelize } = require('../config/db.config');

const User = require('./user.model')(sequelize);
const Field = require('./field.model')(sequelize);
const FieldType = require('./field-type.model')(sequelize);

FieldType.hasMany(Field, { 
        foreignKey: 'fieldType_id',
        as: 'fields'
    });
    
Field.belongsTo(FieldType, { 
        foreignKey: 'fieldType_id',
        as: 'fieldType'
    });


module.exports = {
    User,
    Field,
    FieldType,
    sequelize,
    Sequelize: sequelize.Sequelize
}