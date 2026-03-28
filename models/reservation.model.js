const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {

    const Reservation = sequelize.define(
        'Reservation', 
        {
            status: {
                type: DataTypes.ENUM('confirmed', 'cancelled', 'completed'),
                defaultValue: 'confirmed'
            }
        },
    );
    return  Reservation;
}