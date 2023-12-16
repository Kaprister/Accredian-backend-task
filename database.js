const mysql = require("mysql");


const db = mysql.createConnection({
    host: "localhost",
    database: "projectlogin",
    user: "root",
    password: "Sushant#07"
})

module.exports = db;