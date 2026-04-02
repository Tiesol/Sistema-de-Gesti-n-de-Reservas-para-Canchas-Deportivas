const { sequelize } = require('../config/db.config');

const User = require('./user.model')(sequelize);
const Field = require('./field.model')(sequelize);
const FieldType = require('./field-type.model')(sequelize);
const Review = require('./review.model')(sequelize);
const TimeSlot = require('./time-slots.model')(sequelize);
const Reservation = require('./reservation.model')(sequelize);

FieldType.hasMany(Field, {
    foreignKey: 'fieldTypeId',
    as: 'fields'
});
Field.belongsTo(FieldType, {
    foreignKey: 'fieldTypeId',
    as: 'fieldType'
});

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

TimeSlot.hasMany(Reservation, {
    foreignKey: 'timeSlotId',
    as: 'reservations'
});
Reservation.belongsTo(TimeSlot, {
    foreignKey: 'timeSlotId',
    as: 'timeSlot'
});

Reservation.hasOne(Review, { 
    foreignKey: 'reservationId', 
    as: 'review' 
});

Review.belongsTo(Reservation, { 
    foreignKey: 'reservationId', 
    as: 'reservation' 
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