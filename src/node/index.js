require('dotenv').config();
const express = require('express')
const morgan = require('morgan')
const NodeCache = require('node-cache')


const app = express()
const port = process.env.PORT || 8000

// init caches
const gameCache = new NodeCache({
    stdTTL: 3600, // 1hr cache
    useClones: false
})

// Setup Express
app.use(morgan('common'))
app.use(express.json())
app.use((req, res, next) => {
    req.gameCache = gameCache
    next()
})

// Express routes
app.use(express.static('public'));
app.use('/api/', require('./route/status'))
app.use('/api/game', require('./route/game'))

// Express error handler
app.use((error, req, res, next) => {
    // Generic error
    res.status(500).json({ error: error.message })
})


// Start server
app.listen(port, () => console.log(`Server started on port ${port}`))
