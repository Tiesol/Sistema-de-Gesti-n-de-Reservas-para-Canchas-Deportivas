const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {

    const Reserva = sequelize.define(
        'Reserva', 
        {
            estado: {
                type: DataTypes.ENUM('confirmada', 'cancelada'),
                defaultValue: 'confirmada'
            }
        },
    );
    return Reserva;
}