const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {

    const FieldType = sequelize.define(
        'FieldType', 
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
        },
    );
    return FieldType;
}