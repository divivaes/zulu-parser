const express = require('express')
const mysql = require('mysql')
const mssql = require('mssql')
const request = require('request')
const cron = require('cron')
const moment = require('moment')
// const logs = require('./config/logger').logger
const cors = require('cors')

// Initializing express to => app
const app = express()

// CORS
app.use(cors())

// Initializing environment variables
require('dotenv').config()

// Connection to DB
const db_config = require('./config/db')
const connection = mysql.createConnection(db_config.connection)
connection.query(`USE ${db_config.database}`)

const setInitialStats = () => {
  console.log('Initializing function -=setInitialStats=- on start')
  connection.query('SELECT * FROM stats', (err, rows) => {
    if (err) console.log(`Error on selecting from table STATS => - ${err}`)
    if (rows.length === 4) {
      console.log('Server rebooted. Updating stats')
      getStats()
    } else if (rows.length > 4) {
      connection.query('TRUNCATE TABLE stats', (err, rows) => {
        if (err) console.log(`Error on truncating table STATS => - ${err}`)
        console.log(
          'Too much data and table will be truncated. Inserting new data'
        )
        insertStats()
      })
    } else if (rows.length === 0) {
      console.log('Table is empty. Inserting new data')
      insertStats()
    }
  })
}

const insertStats = async () => {
  await request(
    {
      url: process.env.APP_WRM_URL,
      method: 'GET',
      headers: [
        {
          name: 'Content-Type',
          value: 'application/json'
        }
      ]
    },
    (error, response, body) => {
      if (error) console.log(`Error on request WRM URL - ${error}`)

      let time = moment()
        .format('YYYY-MM-DD hh:mm:ss')
        .trim()
      body = JSON.parse(body)
      body.forEach(obj => {
        connection.query('INSERT INTO stats SET ?', obj, (err, rows) => {
          if (err) console.log(`Error on inserting to table STATS => - ${err}`)
        })
      })
      console.log(`Inserted new values to table STATS on - ${time}`)
    }
  )
}

const getStats = async () => {
  await request(
    {
      url: process.env.APP_WRM_URL,
      method: 'GET',
      headers: [
        {
          name: 'Content-Type',
          value: 'application/json'
        }
      ]
    },
    (error, response, body) => {
      if (error) console.log(`Error on request WRM URL - ${error}`)

      let time = moment()
        .format('YYYY-MM-DD hh:mm:ss')
        .trim()
      body = JSON.parse(body)
      body.forEach(obj => {
        connection.query(
          `UPDATE stats SET ? WHERE flowmeter_id = ${obj.flowmeter_id} `,
          obj,
          (err, rows) => {
            if (err) console.log(`Error on updating to table STATS => - ${err}`)
          }
        )
      })
      console.log(`Updated values in table STATS on - ${time}`)
    }
  )
}

const cronJob_getStats_after_start = cron.job('0 */15 * * * *', () => {
  let time = moment()
    .format('YYYY-MM-DD hh:mm:ss')
    .trim()
  console.log(`=cronJob_getStats_after_start= started at - ${time}`)
  getStats()
})

setInitialStats()

cronJob_getStats_after_start.start()

// Starting server
const port = process.env.PORT || 5000

app.listen(port, () => console.log(`Magic is happening on port ${port}`))
