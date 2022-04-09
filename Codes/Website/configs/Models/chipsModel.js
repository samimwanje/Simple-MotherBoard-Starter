'use strict'
const mongoose = require('mongoose')

// Create a schema.
const chipsData = new mongoose.Schema({
  chipId: { type: String, required: true, unique: true }
}, { timestamp: true, versionKey: false })

// Create a model (table) using the schema.
const chipsModel = mongoose.model('chipsData', chipsData)

// Export the module
module.exports = chipsModel
