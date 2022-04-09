'use strict'
const User = require('../../configs/Models/userModel')
const Data = require('../../configs/Models/dataModel')
const SoftWare = require('../../configs/Models/softModel')
const switchController = {}
// const { promisify } = require('util')

// Rendering the view of "/" get.
/**
 *Used to indicate that the user has toggled the switch.
 * @param {object} req - Express request object.
 * @param {object} res -  Express response object.
 * @param {object} next -  Express next middleware function
 */
switchController.status = async (req, res) => {
// http://localhost:5000/functions/userSwitch/n4xHw&2z11

  const id = req.params.id

  try {
    const status = await User.findOne({ chipId: id })
    // console.log(status)
    res.send(status.toggle)
  } catch (error) {
    res.send('3')
  }
}

// Rendering the view of "/" get.
/**
 *Used to indicate that the user has toggled the switch.
 * @param {object} req - Express request object.
 * @param {object} res -  Express response object.
 * @param {object} next -  Express next middleware function
 */
switchController.toggles = async (req, res) => {
  // http://localhost:5000/functions/userSwitch/n4xHw&2z11

  const id = req.params.id
  try {
    const number = await SoftWare.findOneAndUpdate({ chipId: id }, { softtoggle: 0 }) // Reset value to 0.
    // console.log(status)
    res.send(number.softtoggle)
  } catch (error) {
    res.send('3')
  }
}

/**
 * Function used to update the online status,
 * From the ESP32 to db.
 * @param {} req
 * @param {*} res
 */
switchController.online = async (req, res) => {
  // http://localhost:5000/functions/userSwitch/n4xHw&2z11

  const id = req.params.id
  const queryData = req.query

  try {
    await User.updateOne({ chipId: id }, queryData)
    res.send('200')
  } catch (error) {
    res.send('3')
  }
}

switchController.userSoft = async (req, res) => {
  // http://192.168.1.193:5000/functions/userSoft/n4xHw&2z11

  const information = req.query.information
  const id = req.params.id

  try {
    await SoftWare.updateOne({ chipId: id }, { information: information })
    res.send('200')
  } catch (error) {
    res.send(error)
  }
}

switchController.userSensors = async (req, res) => {
  // http://localhost:5000/functions/userSwitch/n4xHw&2z11

  const id = req.params.id
  process.env.TZ = 'Europe/Stockholm'

  const created = new Date().toString() // Get the current time.
  const temp = req.query.temp
  const energy = req.query.energy
  const pm2 = req.query.pm2

  // console.log(req.query)

  try {
    const username = await User.findOne({ chipId: id })

    await Data.create({
      created: created,
      temp: temp,
      energy: energy,
      pm2: pm2,
      chipId: id,
      username: username.username
    })

    res.send('200')
  } catch (error) {
    res.send('3')
  }
}

module.exports = switchController
