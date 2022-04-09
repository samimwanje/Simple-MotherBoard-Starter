'use strict'
const mongoose = require('mongoose')

/**
 *Intialize and connect to the  mongodb server.
 */
module.exports.connect = async () => {
  mongoose.connection.on('connected', () => console.log('Mongoose connection is open.'))
  mongoose.connection.on('error', err => console.error(`Mongoose connection error has occured: ${err}`))
  mongoose.connection.on('dissconnected', () => console.log('Mongoose connection is disconnected.'))

  // If the Node process end, close the mongoose connection.
  process.on('SIGNINT', () => {
    mongoose.connection.close(() => {
      console.log('Mongoose connection is deisconnected due to application teermnation')
      process.exit(0)
    })
  })

  // Connect to the server

  return mongoose.connect(process.env.DB_CONNECTION_STRING,
    async (err) => {
      if (err) throw err
      console.log('Conncted to MongoDB')
    }
  )
}
