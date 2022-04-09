'use strict'
const mongoose = require('mongoose')

// Create a schema.
const userSoft = new mongoose.Schema({
  updated: { type: String, required: true, unique: false },
  information: { type: String, required: true, unique: false },
  cputemp: { type: String, required: true, unique: false },
  cpuuse: { type: String, required: true, unique: false },
  ramuse: { type: String, required: true, unique: false },
  space: { type: String, required: true, unique: false },
  softtoggle: { type: String, required: true, unique: false },
  chipId: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true }
}, { timestamp: true, versionKey: false })

// Create a model (table) using the schema.
const softModel = mongoose.model('userSoft', userSoft)

// Export the module
module.exports = softModel
