const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {

    const Horario = sequelize.define(
        'Horario', 
        {
            fecha: {
                type: DataTypes.DATEONLY,
                allowNull: false
            },
            hora_inicio: {
                type: DataTypes.TIME,
                allowNull: false
            },
            hora_fin: {
                type: DataTypes.TIME,
                allowNull: false
            },
            disponible: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
            }
        },
    );
    return Horario;
}