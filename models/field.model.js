const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {

    const Field = sequelize.define(
        'Field', 
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            price_per_hour: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            state: {
                type: DataTypes.ENUM('available', 'unavailable'),
                defaultValue: 'available',
            },
        },
    );
    return Field;
}