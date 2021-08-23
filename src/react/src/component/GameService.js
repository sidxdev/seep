const axios = require('axios')

export default class GameService {
    constructor(server) {
        this.axios = axios.create({
            baseURL: server
        });
        this.loaded = false
    }

    async refresh() {
        try {
            let game = await this.axios.get(`/game/${this.gameId}/status/${this.playerId}`)
        Object.assign(this, game.data);
            return true
        } catch (error) {
            return false
        }
    }

    async newGame() {
        // check if there is an existing game in cache
        let existingGameId = window.localStorage.getItem('gameId')
        let existingPlayerId = window.localStorage.getItem('playerId')
        try {
            if (existingGameId && existingPlayerId) {
                this.gameId = existingGameId
                this.playerId = existingPlayerId
            } else {
                // create the game
                let game = await this.axios.post('/game');
                this.gameId = game.data.gameId
                // join the game
                let player = await this.axios.post(`/game/${this.gameId}/join`)
                this.playerId = player.data.playerId

                window.localStorage.setItem('gameId', this.gameId)
                window.localStorage.setItem('playerId', this.playerId)
            }
            this.loaded = true
        } catch (err) {
            throw new Error('Cannot create new game.')
        }
    }

    async joinGame(gameId) {
        let player = await this.axios.post(`/game/${gameId}/join`)
        let playerId = player.data.playerId

        window.localStorage.setItem('gameId', gameId)
        window.localStorage.setItem('playerId', playerId)
    }
}