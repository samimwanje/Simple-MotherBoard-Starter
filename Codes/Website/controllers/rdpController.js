'use strict'
const rdpController = {}
// const { promisify } = require('util')

// Rendering the view of "/" get.
/**
 *Used to render the start page.
 * @param {object} req - Express request object.
 * @param {object} res -  Express response object.
 * @param {object} next -  Express next middleware function
 */
rdpController.rdp = (req, res, next) => { res.render('rdp') }

module.exports = rdpController
