const mysql = require("mysql2")

const db = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'student-management'
})

module.exports = db