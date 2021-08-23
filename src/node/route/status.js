const router = require('express').Router()


// Get server status
router.get('/', (req, res) => {
    let { keys: games, vsize: bytes } = req.gameCache.getStats()
    res.json({ games, bytes })
})


module.exports = router