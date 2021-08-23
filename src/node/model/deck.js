const Card = require('./card')

class Deck {

    constructor() {
        this.initDeck()
    }

    initDeck() {
        let deck = []
        // spades with points
        for (let i = 1; i <= 13; ++i) deck.push(new Card(Card.SUITS.SPADES, i, i))
        // hearts
        deck.push(new Card(Card.SUITS.HEARTS, 1, 1))
        for (let i = 2; i <= 13; ++i) deck.push(new Card(Card.SUITS.HEARTS, i, 0))
        // clubs
        deck.push(new Card(Card.SUITS.CLUBS, 1, 1))
        for (let i = 2; i <= 13; ++i) deck.push(new Card(Card.SUITS.CLUBS, i, 0))
        // diamonds
        deck.push(new Card(Card.SUITS.DIAMONDS, 1, 1))
        for (let i = 2; i <= 9; ++i) deck.push(new Card(Card.SUITS.DIAMONDS, i, 0))
        deck.push(new Card(Card.SUITS.DIAMONDS, 10, 6))
        for (let i = 11; i <= 13; ++i) deck.push(new Card(Card.SUITS.DIAMONDS, i, 0))

        this.cards = deck
        this.shuffle()
    }

    shuffle() {
        let currentIndex = this.cards.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = this.cards[currentIndex];
            this.cards[currentIndex] = this.cards[randomIndex];
            this.cards[randomIndex] = temporaryValue;
        }
    }

    getFirstFour() {
        let cards = this.cards.slice(0, 4)
        let isValid = cards.some(c => c.number >= 9)

        while (!isValid) {
            this.shuffle()
            cards = this.cards.slice(0, 4)
            isValid = cards.some(c => c.number >= 9)
        }

        return cards
    }

    getFirstPlayerCardsAfterHouse() {
        return this.cards.slice(8, 16)
    }

    getStartFloor() {
        return this.cards.slice(4, 8)
    }

    getStartCardsFor(player) {
        return this.cards.slice(12 * player + 4, 12 * player + 16)
    }

}

module.exports = Deck