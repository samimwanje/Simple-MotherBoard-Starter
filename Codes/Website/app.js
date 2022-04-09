'use strict'
const express = require('express') // Init express.
const hbs = require('express-hbs')
const session = require('express-session') // Model used for the session cookies
const cookieParser = require('cookie-parser') // Used so cookie can be viewed.
const mongoose = require('./configs/mongoose')
const logger = require('morgan') // Logger for console.
const path = require('path') // Used for simplier pathes.
const { join } = require('path') // Used for simplier pathes.
require('dotenv').config() // Important data is held here, on an nonaccessable file.

// Start the app with the port.
const app = express()
const port = 5000

const http = require('http')

// Connect to the data base.
mongoose.connect().catch(error => {
  console.error(error)
  process.exit(1)
})

// View engine
app.engine('hbs', hbs.express4({
  defaultLayout: path.join(__dirname, 'views', 'layouts', 'default'),
  partialsDir: join(__dirname, 'views', 'partials') // Foooter and so on.
}))
// Set the view engine, where the 'html' files are located.
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'views'))

// initialize express session
const sessionOptions = {
  name: 'Name of first dog', // Something secret
  secret: process.env.COOKIE_SECRET, // The super secret message, makes sure that the cookie value is hashed.
  resave: false, // Cookie will reset everytime the client connects
  saveUninitialized: false, // Create a new session if it is needed. If no session is required, no one will be created.
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    sameSite: 'lax'
  }

}
app.use(session(sessionOptions))

app.use((req, res, next) => {
// Flash message will be removed after a round trip.
  if (req.session.flash) {
    res.locals.flash = req.session.flash
    delete req.session.flash
  }

  // Handle logged in user view.
  if (req.session.user) {
    res.locals.user = req.session.user
  }
  next()
})

// Init morgan
app.use(logger('dev'))

// Parse URL-encoded bodies sent by HTML-forms.
app.use(express.urlencoded({ extended: false }))

// Values from form are recieved as json.
app.use(express.json())

// Intiliaze so cookies can be set up.
app.use(cookieParser())

// Defining the public directory of the static files. css, java etc.
const publicDirectory = path.join(__dirname, './public')
app.use(express.static(publicDirectory))

// Router handling the / calls on start page.
app.use('/', require('./routes/indexRouter'))
app.use('/account', require('./routes/accountRouter'))
app.use('/rdp', require('./routes/rdpRouter'))
app.use('/login', require('./routes/loginRouter'))
app.use('/register', require('./routes/registerRouter'))
app.use('/about', require('./routes/aboutRouter'))
app.use('/functions', require('./routes/functionsRouter'))

// Error handling if user tries to access not existing page.
app.use('*', (req, res) => {
// Render the error page.
  console.log(req.body.sami)
  res.status(404).render('errors/404')
})

// Start the server
const server = http.createServer(app).listen(port, function () {
  console.log('Server started at port ' + port)
})

// Socket SETTINGS!!
// And create the websocket server
const io = require('socket.io')(server)

const User = require('./configs/Models/userModel.js')
const Data = require('./configs/Models/dataModel.js')
const SoftWare = require('./configs/Models/softModel')
// This is called every time a client is conneting
// the socket is for the client that connects
io.on('connection', (socket) => {
  // When a client makes a call from switch button
  socket.on('prev', async (data) => {
    try {
      await SoftWare.updateOne({ username: data }, { softtoggle: 3 }) // Reset value to 0.
    } catch (error) {
      socket.emit('message', 'Socket Failed')
    }
  })

  // When a client makes a call from switch button
  socket.on('playPause', async (data) => {
    try {
      await SoftWare.updateOne({ username: data }, { softtoggle: 4 }) // Reset value to 0.
    } catch (error) {
      socket.emit('message', 'Socket Failed')
    }
  })

  // When a client makes a call from switch button
  socket.on('next', async (data) => {
    try {
      await SoftWare.updateOne({ username: data }, { softtoggle: 5 }) // Reset value to 0.
    } catch (error) {
      socket.emit('message', 'Socket Failed')
    }
  })

  // When a client makes a call from switch button
  socket.on('volUp', async (data) => {
    try {
      await SoftWare.updateOne({ username: data }, { softtoggle: 6 }) // Reset value to 0.
    } catch (error) {
      socket.emit('message', 'Socket Failed')
    }
  })

  // When a client makes a call from switch button
  socket.on('volDown', async (data) => {
    try {
      await SoftWare.updateOne({ username: data }, { softtoggle: 7 }) // Reset value to 0.
    } catch (error) {
      socket.emit('message', 'Socket Failed')
    }
  })

  // When a client makes a call from switch button
  socket.on('restartButton', async (data) => {
    try {
      await SoftWare.updateOne({ username: data }, { softtoggle: 2 }) // Reset value to 0.
      socket.emit('restartButton', 'restarted')
    } catch (error) {
      socket.emit('message', 'Socket Failed')
    }
  })

  // When a client makes a call from switch button
  socket.on('shutdownButton', async (data) => {
    try {
      await SoftWare.updateOne({ username: data }, { softtoggle: 1 }) // Reset value to 0.

      socket.emit('shutdownButton', 'shutdown')
    } catch (error) {
      socket.emit('message', 'Socket Failed')
    }
  })

  // When a client makes a call from switch button
  socket.on('switchButton', async (data) => {
    try {
      const status = await User.findOne({ username: data })

      if (status.toggle === '1') { await User.updateOne({ username: data }, { toggle: 0 }) } else { await User.updateOne({ username: data }, { toggle: 1 }) }

      socket.emit('switchButton', 'Toggled')
    } catch (error) {
      socket.emit('message', 'Socket Failed')
    }
  })

  // State of current PC status.
  socket.on('online', async (data) => {
    try {
      const status = await User.findOne({ username: data })

      // Respond to client
      socket.emit('online', { status: status.online, update: data.edited })
    } catch (error) {
      socket.emit('message', error)
    }
  })

  // State of current PC status.
  socket.on('sensors', async (data) => {
    try {
      const status = await Data.find({ username: data }).sort({ $natural: -1 }).limit(1)
      socket.emit('sensors', status[0])
    } catch (error) {
      socket.emit('message', error)
    }
  })
})
