'use strict'
const User = require('../configs/Models/userModel')
const Chips = require('../configs/Models/chipsModel')
const SoftWare = require('../configs/Models/softModel')
const registerController = {}

// Rendering the view of the "/register" get.
/**
 *
 * @param {object} req - Express request object.
 * @param {object} res -  Express response object.
 * @param {object} next -  Express next middleware function
 */
registerController.registerGet = (req, res, next) => {
  res.render('register')
}

// Handling a post from "/register"
/**
 * Function used to register a new user.
 * @param {object} req - Express request object.
 * @param {object} res -  Express response object.
 * @param {object} next -  Express next middleware function
 */
registerController.registerPost = async (req, res) => {
  const username = req.body.username
  const password = req.body.password
  const chipId = req.body.chipId
  process.env.TZ = 'Europe/Stockholm'
  const edited = new Date().toString() // Get the current time.
  const toggle = '0'
  const online = '0'

  const updated = edited
  const information = 'Please install your software to get readings.'
  const cputemp = 0
  const cpuuse = 0
  const ramuse = 0
  const space = 0
  const softtoggle = 0

  let dbId

  try { // Check if chipId is in database.
    dbId = await Chips.findOne({ chipId })
    if (!dbId) {
      throw new NullPointerException()
    }
  } catch (error) {
    const flash = { type: 'danger', text: `Chip ID '${chipId.substring(0, 6)}...' does not exists in our system.` } // Something wrong on server side.
    res.status(401)
    res.render('register', { flash }) // Rerender the page with the view data that will be sent to the  will be sent as => {{viewData}}
    return
  }

  if (password.length < 8) {
    res.status(401)
    const flash = { type: 'danger', text: 'The password is too short.' }
    res.render('register', { flash }) // Rerender the page with the view data that will be sent to the  will be sent as => {{viewData}}
  } else if (!username || (/\s/).test(username) || username.length > 20) {
    res.status(401)
    const flash = { type: 'danger', text: 'Username was not entered correctly.' }
    res.render('register', { flash }) // Rerender the page with the view data that will be sent to the  will be sent as => {{viewData}}
  } else if (password !== req.body.passwordConfirm) {
    const flash = { type: 'danger', text: 'Passwords do not match.' }
    res.status(401)
    res.render('register', { flash }) // Rerender the page with the view data that will be sent to the  will be sent as => {{viewData}}
  } else {
    try {
      // Create new user model.
      await User.create({
        username,
        password,
        edited,
        online,
        toggle,
        chipId
      })

      // Create new user software model.
      await SoftWare.create({
        updated,
        information,
        cputemp,
        cpuuse,
        ramuse,
        space,
        softtoggle,
        chipId,
        username
      })

      res.status(200)
      req.session.flash = { type: 'success', text: 'Account successfully created. You can now login.' }
      const flash = req.session.flash
      res.render('register', { flash }) // Rerender the page with the view data that will be sent to the  will be sent as => {{viewData}}
    } catch (error) {
      const flash = { type: 'danger', text: `An account with that ${Object.keys(error.keyValue)} already exists.` } // Something wrong on server side.
      res.status(401)
      res.render('register', { flash }) // Rerender the page with the view data that will be sent to the  will be sent as => {{viewData}}
    }
  }
}

module.exports = registerController
