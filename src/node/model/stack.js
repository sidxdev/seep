class Stack {

    constructor(house, cards) {
        if (house < 9 || house > 13) throw new Error('House must be between 9 & 13 in value.')

        this.house = house
        this.cards = cards

        let sum = cards.reduce((a, c) => a + c.number, 0)
        let times = sum / house;
        if(times !== parseInt(times) || times < 1) throw new Error('Invalid House.');
        this.isStrong = times !== 1
    }

    addCards(cards) {
        let sum = cards.reduce((a, c) => a + c.number, 0)
        if (sum % this.house !== 0) throw new Error('Cannot add to the house.')

        this.cards = this.cards.concat(cards)
        this.isStrong = true
    }

    increaseHouse(cards) {
        if (this.isStrong) throw new Error('House is already strong.')

        let sum = cards.reduce((a, c) => a + c.number, 0)

        if ((this.house + sum) > 13) throw new Error('House must be below 13 in value.')

        this.house += sum
        this.cards = this.cards.concat(cards)
    }

}

module.exports = Stack