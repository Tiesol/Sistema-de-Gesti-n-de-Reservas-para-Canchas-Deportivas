const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {

    const Reservation = sequelize.define(
        'Reservation', 
        {
            status: {
                type: DataTypes.ENUM('confirmed', 'cancelled'),
                defaultValue: 'confirmed'
            }
        },
    );
    return  Reservation;
}