const Sequelize = require('sequelize');
const sequelize = require('../util/database.js');

const Order = sequelize.define('order', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    totalAmount: Sequelize.DOUBLE
})


 module.exports = Order