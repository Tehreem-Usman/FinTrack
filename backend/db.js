const mysql = require("mysql2/promise");

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "zse456p2x8",
    database: "fintrack"
});

module.exports = db;