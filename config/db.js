require('dotenv').config()

module.exports = {
  connection: {
    host: process.env.APP_DB_HOST,
    user: process.env.APP_DB_USER,
    password: process.env.APP_DB_PASSWORD,
    multipleStatements: true
  },
  database: process.env.APP_DB_DATABASE
}
