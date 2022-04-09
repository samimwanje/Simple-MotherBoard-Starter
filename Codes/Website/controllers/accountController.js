'use strict'
const User = require('../configs/Models/userModel')
const Data = require('../configs/Models/dataModel')
const SoftWare = require('../configs/Models/softModel')
const accountController = {}

/**
 * Used to start all the account.
 * @param {object} req - Express request object.
 * @param {object} res -  Express response object.
 * @param {object} next -  Express next middleware function
 */
accountController.start = async (req, res) => {
  if (req.session.user) { // Check if the user is signed in.
    if (req.query.error) { // Used to handle error status code.
      res.status(req.query.error)
    }

    try {
      const info = await SoftWare.find({ username: req.session.user.username }).lean() // start all available account.
      res.render('account/account', { info: info[0].information.replace(/(\r\n|\n|\r)/gm, '<br>') })
    } catch (error) {
      req.session.flash = { type: 'danger', text: 'Something went wrong.' }
      res.status(500).render('index', { flash: req.session.flash }) // If db server is probably offline.
    }
  } else {
    req.session.flash = { type: 'danger', text: 'You must login to view your account page.' } // If not flash message with error will be displayed.
    res.redirect('/login?error=402')
  }
}

accountController.status = async (req, res) => {
  if (req.session.user) { // Check if the user is signed in.
    try {
      res.render('account/status')
    } catch (error) {
      req.session.flash = { type: 'danger', text: 'Something went wrong.' }
      res.status(500).render('index', { flash: req.session.flash }) // If db server is probably offline.
    }
  } else {
    req.session.flash = { type: 'danger', text: 'You must login to view your account page.' } // If not flash message with error will be displayed.
    res.redirect('/login?error=402')
  }
}

accountController.sensors = async (req, res) => {
  if (req.session.user) { // Check if the user is signed in.
    try {
      res.render('account/sensors')
    } catch (error) {
      req.session.flash = { type: 'danger', text: 'Something went wrong.' }
      res.status(500).render('index', { flash: req.session.flash }) // If db server is probably offline.
    }
  } else {
    req.session.flash = { type: 'danger', text: 'You must login to view your account page.' } // If not flash message with error will be displayed.
    res.redirect('/login?error=402')
  }
}

accountController.media = async (req, res) => {
  if (req.session.user) { // Check if the user is signed in.
    try {
      const rows = await User.find({}).lean() // start all available account.
      res.render('account/media', { rows })
    } catch (error) {
      req.session.flash = { type: 'danger', text: 'Something went wrong.' }
      res.status(500).render('index', { flash: req.session.flash }) // If db server is probably offline.
    }
  } else {
    req.session.flash = { type: 'danger', text: 'You must login to view your account page.' } // If not flash message with error will be displayed.
    res.redirect('/login?error=402')
  }
}

accountController.graphs = async (req, res) => {
  if (req.session.user) { // Check if the user is signed in.
    if (req.query.error) { // Used to handle error status code.
      res.status(req.query.error)
    }

    try {
      let rows = await Data.find({ username: req.session.user.username }).lean() // start all available account.

      // console.log(rows)
      const maxPoints = 60
      if (rows.length > maxPoints) { rows = rows.slice(rows.length - maxPoints, rows.length) }

      res.render('account/graphs', { rows: JSON.stringify(rows) })
    } catch (error) {
      req.session.flash = { type: 'danger', text: 'Something went wrong.' }
      res.status(500).render('index', { flash: req.session.flash }) // If db server is probably offline.
    }
  } else {
    req.session.flash = { type: 'danger', text: 'You must login to view your account page.' } // If not flash message with error will be displayed.
    res.redirect('/login?error=402')
  }
}

module.exports = accountController
