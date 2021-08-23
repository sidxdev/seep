const Card = require('./card')
const util = require('../lib/util')

class Turn {

    static get INTENT() {
        return {
            PICK: 'PICK',
            HOUSE: 'HOUSE'
        }
    }

    static get TARGET_TYPE() {
        return {
            CARD: 'CARD',
            HOUSE: 'HOUSE'
        }
    }

    static get PLAY_TYPE() {
        return {
            LOOSE_CARD: 'LOOSE_CARD',
            SINGLE_TARGET: 'SINGLE_TARGET',
            MULTI_TARGET: 'MULTI_TARGET'
        }
    }

    constructor(playerId, turn) {
        util.check(playerId)
        util.check(turn, ['play', 'intent'])
        util.check(turn.play, ['number', 'suit'])

        if (!Card.SUITS.hasOwnProperty(turn.play.suit)
            || (turn.play.number < 1 || turn.play.number > 13))
            throw new Error('Invalid Card in turn.')

        this.playerId = playerId
        this.play = turn.play
        this.play.card = new Card(this.play.suit, this.play.number)
        this.target = []
        this.play.type = Turn.PLAY_TYPE.LOOSE_CARD
        this.intent = turn.intent

        if (turn.target && Array.isArray(turn.target) && turn.target.length > 0) {
            turn.target.forEach(target => {
                util.check(target, ['type'])
                if (target.type === Turn.TARGET_TYPE.CARD) {
                    util.check(target, ['number', 'suit'])
                } else if (target.type === Turn.TARGET_TYPE.HOUSE) {
                    util.check(target, ['house'])
                } else {
                    throw new Error('Invalid Target Type.')
                }
                this.target.push(target)
            });

            this.play.type = this.target.length > 1 ? Turn.PLAY_TYPE.MULTI_TARGET : Turn.PLAY_TYPE.SINGLE_TARGET
        }
    }

}

module.exports = Turn