'use strict'
const mongoose = require('mongoose')

// Create a schema.
const userData = new mongoose.Schema({
  created: { type: String, required: true, unique: false },
  temp: { type: String, required: true, unique: false },
  energy: { type: String, required: true, unique: false },
  pm2: { type: String, required: true, unique: false },
  chipId: { type: String, required: true, unique: false },
  username: { type: String, required: true, unique: false }
}, { timestamp: true, versionKey: false })

// Create a model (table) using the schema.
const dataModel = mongoose.model('userData', userData)

// Export the module
module.exports = dataModel
