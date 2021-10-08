const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'shopuser',
    database: 'nodeshop',
    password: 'secret'
})

module.exports = pool.promise();