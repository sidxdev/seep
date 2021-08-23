const router = require('express').Router()
const Game = require('../model/game')
const expressUtil = require('../lib/express-util')

const startNewGame = (req, res) => {
    let game = new Game()
    req.gameCache.set(game.id, game)
    res.header('x-game-id', game.id)
    res.status(201).json({ gameId: game.id })
}

const getGameStatusAdmin = (req, res, next) => {
    let game = req.gameCache.get(req.params.gameId)
    if (game === undefined) return res.sendStatus(404)
    res.json(game)
}

const getGameStatusPlayer = (req, res) => {
    let game = req.gameCache.get(req.params.gameId)
    if (game === undefined) return res.sendStatus(404)

    try {
        res.json(game.showTo(req.params.playerId))
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const joinGame = (req, res) => {
    let game = req.gameCache.get(req.params.gameId)
    if (game === undefined) return res.sendStatus(404)

    try {
        let playerId = game.join()
        res.header('x-player-id', playerId)
        res.status(202).json({ playerId })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const callFirstHouse = (req, res) => {
    let game = req.gameCache.get(req.params.gameId)
    if (game === undefined) return res.sendStatus(404)

    let playerId = req.body.playerId
    if (!game.isPlayer(playerId)) return res.sendStatus(404)

    if (game.currentPlayerTurn !== playerId)
        return res.status(401).json({ error: 'Not your turn' })

    game.callHouse(req.body.house)
    res.sendStatus(200)
}

const playTurn = (req, res) => {
    let game = req.gameCache.get(req.params.gameId)
    if (game === undefined) return res.sendStatus(404)

    let playerId = req.body.playerId
    if (!game.isPlayer(playerId)) return res.sendStatus(404)

    const gameSaveState = game.getSaveState()
    try {
        game.play(playerId, req.body.turn)
        res.json(game)
    } catch (error) {
        // restore game state
        gameSaveState.rollback();
        res.status(500).json({ error: error.message })
    }
}

// Start a new game
router.post('/', startNewGame)

// Get current game status (admin)
router.get('/:gameId', expressUtil.checkForAdminKey, getGameStatusAdmin)

// Get current game status (player)
router.get('/:gameId/status/:playerId', getGameStatusPlayer)

// Join a game
router.post('/:gameId/join', joinGame)

// First player calls first house
router.post('/:gameId/house', callFirstHouse)

// Play turn
router.post('/:gameId/play', playTurn)


module.exports = router