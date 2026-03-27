const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {

    const TimeSlot = sequelize.define(
        'TimeSlot', 
        {
            date: {
                type: DataTypes.DATEONLY,
                allowNull: false
            },
            startTime: {
                type: DataTypes.TIME,
                allowNull: false
            },
            endTime: {
                type: DataTypes.TIME,
                allowNull: false
            },
            isAvailable: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
            }
        },
    );
    return TimeSlot;
}