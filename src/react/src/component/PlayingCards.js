import React, { Component } from 'react'
import { Card, Image } from 'semantic-ui-react'

// import all PNG cards
let CARD_PNG = {};
const SUITS = ['spade', 'heart', 'club', 'diamond'];
const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'jack', 'queen', 'king'];
SUITS.forEach(suit =>
    NUMBERS.forEach(number =>
        CARD_PNG[suit + number] = require(`svg-cards/png/1x/${suit}_${number}.png`)))


class PlayingCard extends Component {
    constructor(props) {
        super(props)

        this.state = {
            card: props.card,
            clicked: props.clicked
        }
    }

    render = () => {
        const { card } = this.state

        let symbol = "" + card.number
        if (card.number === 11) symbol = 'jack'
        else if (card.number === 12) symbol = 'queen'
        else if (card.number === 13) symbol = 'king'

        let suit = ''
        if (card.suit === 'SPADES') suit = 'spade'
        else if (card.suit === 'HEARTS') suit = 'heart'
        else if (card.suit === 'CLUBS') suit = 'club'
        else if (card.suit === 'DIAMONDS') suit = 'diamond'

        return < Card onClick={() => {
            this.props.onSelectCardHandler(this.props.index)
        }} className={this.props.clicked ? 'card-selected' : ''}>
            <Image src={CARD_PNG[suit + symbol]} wrapped ui={false} />
        </Card >
    }
}


export class PlayingCards extends Component {
    constructor(props) {
        super(props)

        this.state = {
            cards: props.cards,
            selectedIndex: props.selectedIndex || []
        }

        this.selectedCardHandler = this.selectedCardHandler.bind(this)
    }

    selectedCardHandler(selectedIndex) {
        // Remove if it's already selected
        let selectedCards = this.state.selectedIndex;
        let indexToRemove = selectedCards.indexOf(selectedIndex)

        if (indexToRemove !== -1) {
            selectedCards.splice(indexToRemove, 1)
        } else {
            // Add it
            if (this.props.multiSelect) {
                let setOfSelected = new Set(selectedCards)
                setOfSelected.add(selectedIndex)
                selectedCards = [...setOfSelected]

            } else {
                selectedCards = [selectedIndex]
            }
        }

        this.setState({ selectedIndex: selectedCards })
        this.props.onSelectedCard(selectedCards)
    }

    render = () => (
        <Card.Group centered itemsPerRow={6} >
            {this.state.cards.map((card, index) => <PlayingCard key={card.number + card.suit} card={card}
                index={index} onSelectCardHandler={this.selectedCardHandler}
                clicked={this.state.selectedIndex.includes(index)} />)}
        </Card.Group>
    )
}