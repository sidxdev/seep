class Card {

    static get SUITS() {
        return {
            SPADES: 'SPADES',
            HEARTS: 'HEARTS',
            CLUBS: 'CLUBS',
            DIAMONDS: 'DIAMONDS'
        };
    }

    constructor(suit, number, points) {
        this.suit = suit
        this.number = number
        this.points = points || 0
    }

}

module.exports = Card