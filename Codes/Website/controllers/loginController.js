'use strict'
const User = require('../configs/Models/userModel')
const loginController = {}

// Rendering the view of the "/login" get.
/**
 *
 * @param {object} req - Express request object.
 * @param {object} res -  Express response object.
 * @param {object} next -  Express next middleware function
 */
loginController.loginForm = (req, res, next) => {
  if (req.session.user) { // If cookie exist login.
    next()
  } else {
    if (req.query.error) { // Used to handle error status code.
      res.status(req.query.error)
    }
    res.render('login') // Else render login page.
  }
}

/**
 * Middlewhere used to controll the cookie data.
 * @param {object} req - Express request object.
 * @param {object} res -  Express response object.
 */
loginController.loginCookie = async (req, res) => {
  try {
    await User.findOne(req.session.user)

    req.session.flash = { type: 'success', text: 'Logged in successfully.' }
    res.status(200)
    res.redirect('/account')
  } catch (error) {
    req.session.flash = { type: 'danger', text: error.message }
    const flash = req.session.flash
    res.status(401)
    res.render('login', { flash }) // Rerender the page with the view data that will be sent to the  will be sent as => {{viewData}}
  }
}

// Handling a post from "/login"
/**
 *
 * @param {object} req - Express request object.
 * @param {object} res -  Express response object.
 * @param {object} next -  Express next middleware function
 */
loginController.loginPost = async (req, res) => {
  try {
    const user = await User.authenticate(req.body.username, req.body.password)

    req.session.flash = { type: 'success', text: 'Logged in successfully.' }
    req.session.user = user
    res.status(200)
    res.redirect('/account')
  } catch (error) {
    req.session.flash = { type: 'danger', text: error.message }
    const flash = req.session.flash
    res.status(401)
    res.render('login', { flash }) // Rerender the page with the view data that will be sent to the  will be sent as => {{viewData}}
  }
}

/**
 * Used to log out the user by deleteing the cookie.
 * @param req
 * @param res
 */
loginController.logOut = (req, res) => {
  delete req.session.user // Deletes the cookie.
  req.session.flash = { type: 'success', text: 'You are now logged out.' }
  res.redirect('/login')
}

module.exports = loginController
