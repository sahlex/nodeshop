const Sequelize = require('sequelize');

const sequelize = new Sequelize('nodeshop', 'shopuser', 'secret', {
    dialect: 'mysql',
    host: 'localhost',
    port: 3306,
});

module.exports = sequelize;