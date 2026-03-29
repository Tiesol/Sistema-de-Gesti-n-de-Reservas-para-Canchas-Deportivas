const { sequelize } = require('../config/db.config');

const User = require('./user.model')(sequelize);
const Field = require('./field.model')(sequelize);
const FieldType = require('./field-type.model')(sequelize);
const Review = require('./review.model')(sequelize);
const TimeSlot = require('./time-slots.model')(sequelize);
const Reservation = require('./reservation.model')(sequelize);

//Jairiño aca estan las Relaciones xD

//Un tipo de cancha tiene muchas canchas, y una cancha pertenece a un solo tipo.
FieldType.hasMany(Field, { 
    foreignKey: 'fieldTypeId',
    as: 'fields'
});
Field.belongsTo(FieldType, { 
    foreignKey: 'fieldTypeId',
    as: 'fieldType'
});

// Una cancha tiene un chingo de horarios y también muchas reseñas.
Field.hasMany(TimeSlot, { 
    foreignKey: 'fieldId',
    as: 'timeSlots'
});
TimeSlot.belongsTo(Field, { 
    foreignKey: 'fieldId',
    as: 'field'
});

Field.hasMany(Review, { 
    foreignKey: 'fieldId',
    as: 'reviews'
});
Review.belongsTo(Field, { 
    foreignKey: 'fieldId',
    as: 'field'
});

// Un usuario puede tener muchas reservas, y también puede dejar un montón de reseñas xd.
User.hasMany(Reservation, { 
    foreignKey: 'userId',
    as: 'reservations'
});
Reservation.belongsTo(User, { 
    foreignKey: 'userId',
    as: 'user'
});

User.hasMany(Review, { 
    foreignKey: 'userId',
    as: 'reviews'
});
Review.belongsTo(User, { 
    foreignKey: 'userId',
    as: 'user'
});

//Ni siquiera yo se como explicarte esto xD, estuve pensando como explicalo pero no se xD
//Confio en vos para entenderlo xd
TimeSlot.hasMany(Reservation, { 
    foreignKey: 'timeSlotId',
    as: 'reservations'
});
Reservation.belongsTo(TimeSlot, { 
    foreignKey: 'timeSlotId',
    as: 'timeSlot'
});

module.exports = {
    User,
    Field,
    FieldType,
    Review,
    TimeSlot,
    Reservation,
    sequelize,
    Sequelize: sequelize.Sequelize
}