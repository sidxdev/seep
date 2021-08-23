const uuid = require('uuid')
const Turn = require('./turn')

class Player {

    constructor(name) {
        this.id = uuid.v4()
        this.name = name
        this.cards = []
        this.picked = []
        this.houseMadeBySelf = []
    }

    setCards(cards) {
        this.cards = cards
    }

    addCards(cards) {
        this.cards = this.cards.concat(cards)
    }

    pickFromFloor(target) {
        if (target.number) {
            this.picked.push(target)
        } else if (target.house) {
            this.picked.push(target.cards)
        }
    }

    removeFromHand(card) {
        let indexToBeRemoved = this.cards.find(c => c.number === card.number && c.suit === card.suit)
        if (indexToBeRemoved === -1) throw new Error('Card not in player hand')
        this.cards.splice(indexToBeRemoved, 1)
    }

    pickFromHand(card) {
        this.picked.push(card)
    }

    isValidTurn(turn) {
        let isValid = this.cards.some(c =>
            c.suit === turn.play.suit && c.number === turn.play.number)

        if (!isValid) throw new Error('Player does not have the card in hand.')
    }

    canPickHouse(house) {
        let isValid = this.houseMadeBySelf.some(h => h === house)

        if (!isValid) throw new Error('Player does not have the house in hand.')
    }

    checkMakeHouse(house) {
        let isValid = this.cards.some(c => c.number === house)

        if (!isValid) throw new Error('Player does not have the house in hand.')
    }

    removeHouseMade(house) {
        let indexToBeRemoved = this.houseMadeBySelf.find(h => h === house)
        this.houseMadeBySelf.splice(indexToBeRemoved, 1)
    }

    addHouseMade(house) {
        this.houseMadeBySelf.push(house)
        this.houseMadeBySelf = [...new Set(this.houseMadeBySelf)];
    }

    hasCard(number) {
        return this.cards.findIndex(c => c.number === number) !== -1
    }

}

module.exports = Player