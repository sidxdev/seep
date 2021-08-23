const Deck = require('./deck')
const Player = require('./player')
const Turn = require('./turn')
const util = require('../lib/util')
const Stack = require('./stack')
const { ObjectState } = require('object-rollback');


class Game {

    static get ERROR() {
        return {
            InvalidPlayError: new Error('Invalid Play.')
        }
    }

    static get STATES() {
        return {
            LOBBY: 'LOBBY',
            DEALING: 'DEALING',
            FIRSTTURN: 'FIRSTTURN',
            PLAYING: 'PLAYING',
            COMPLETE: 'COMPLETE'
        }
    }

    constructor() {
        this.state = Game.STATES.LOBBY
        this.floor = []
        this.deck = new Deck()
        this.initId()
        this.players = []
        this.currentPlayerTurn = null
        this.startHouse = null
        this.currentHouses = []
    }

    getSaveState() {
        return new ObjectState(this)
    }

    initId() {
        this.id = Math.floor(100000 + Math.random() * 900000)
    }

    join() {
        if (this.players.length >= 4) throw new Error('Game full.')
        let player = new Player(`Player${this.players.length + 1}`)
        this.players.push(player)

        if (this.players.length === 4) this.start()
        return player.id
    }

    isPlayer(playerId) {
        return this.players.some(p => p.id === playerId)
    }

    getPlayer(playerId) {
        let player = this.players.find(p => p.id === playerId)
        if (!player) throw new Error('Player is not part of Game.')
        return player
    }

    getPlayerPartner(player) {
        let playerIndex = this.players.findIndex(p => p.id === player.id)
        return this.players[(playerIndex + 2) % 4]
    }

    showTo(playerId) {
        let self = this.getPlayer(playerId)

        let isTurn = this.currentPlayerTurn === playerId
        // Don't show player 1 the floor until house is picked
        let showFloor = isTurn && this.startHouse !== null

        return {
            state: this.state,
            floor: showFloor ? this.floor : [],
            isTurn,
            startHouse: this.startHouse,
            currentHouses: this.currentHouses,
            self
        }
    }

    start() {
        if (this.players.length !== 4)
            throw new Error('Game needs 4 players.')

        if (this.state !== Game.STATES.LOBBY)
            throw new Error('Game already started.')

        this.state = Game.STATES.DEALING
        this.currentPlayerTurn = this.players[0].id

        this.players[0].setCards(this.deck.getFirstFour())
        this.floor = this.deck.getStartFloor()
        for (let i = 1; i <= 3; ++i)
            this.players[i].setCards(this.deck.getStartCardsFor(i))
    }

    callHouse(house) {
        if (this.state !== Game.STATES.DEALING)
            throw new Error('House can only be called at start of Game')

        // validate called house exists in player one hand
        let isValid = this.players[0].cards.some(c => c.number === house)
        if (!isValid)
            throw new Error('House called must exist in hand.')

        if (house < 9 || house > 13)
            throw new Error('House must be between 9 & 13.')

        this.startHouse = house
        this.state = Game.STATES.FIRSTTURN
    }

    play(playerId, turnParams) {
        // check it's this players turn
        if (this.currentPlayerTurn !== playerId)
            throw new Error('Not your turn.')

        let player = this.getPlayer(playerId)
        let turn = new Turn(playerId, turnParams)

        // check player has the play in hand
        player.isValidTurn(turn)

        // First turn conditions
        if (this.state === Game.STATES.FIRSTTURN) {
            if (turn.intent === Turn.INTENT.PICK && turn.play.number !== this.startHouse)
                throw new Error('Must make house.')
            if (turn.intent === Turn.INTENT.HOUSE) {
                let sumOfCards;
                if (turn.target.length === 1)
                    sumOfCards = turn.target[0].number + turn.play.number
                else if (turn.target.length === 0)
                    sumOfCards = turn.play.number;
                else
                    sumOfCards = turn.target.reduce((a, t) => a + t.number, 0) + turn.play.number

                if (sumOfCards % this.startHouse !== 0)
                    throw new Error('Must make house.')
            }
        }

        // execute turn
        this.executeTurn(turn)

        // player1 first turn of game
        if (this.state === Game.STATES.FIRSTTURN) {
            player.addCards(this.deck.getFirstPlayerCardsAfterHouse())
            this.state = Game.STATES.PLAYING
        }

        this.nextTurn()
    }

    nextTurn() {
        let playerIndex = this.players.findIndex(p => p.id === this.currentPlayerTurn)
        this.currentPlayerTurn = this.players[(playerIndex + 1) % 4].id
    }

    /* possible turns
     *    
     * - throw loose card
     *   - stays loose
     *   - auto picks card of same value
     *   - auto picks house of same value
     *   - auto picks multiple cards combined to same value
     * 
     * - single target
     *   - picks card of same value
     *   - picks house of same value
     *   - increases weak house value
     *   - combines to make a new house
     *   - combines into existing house
     *   - stacks on existing house
     * 
     * - multi target
     *   - picks multiple cards of same combined value
     *   - pick a house alongwith other cards
     *   - combines to make a new house
     *   - combines into existing house 
     *   - increase weak house
    */
    executeTurn(turn) {
        let self = this.getPlayer(turn.playerId)

        if (turn.play.type === Turn.PLAY_TYPE.LOOSE_CARD) {
            this.executeLooseThrow(self, turn)
            return
        }

        switch (turn.intent) {
            case Turn.INTENT.PICK:
                this.isValidPick(self, turn.play.number, turn.target)
                this.executePick(self, turn)
                return

            case Turn.INTENT.HOUSE:
                let houseBeingMade = this.isValidHousePlay(self, turn.play.number, turn.target)
                this.executeHousePlay(self, turn, houseBeingMade)
                return;

            default: throw Game.ERROR.InvalidPlayError
        }
    }

    // return false or the house being made
    isValidHousePlay(player, playNumber, targets) {
        let partner = this.getPlayerPartner(player)

        let isOnlyCards = targets.every(t => t.number)
        if (isOnlyCards) {
            let sumOfCards = playNumber;
            if (targets.length === 1) sumOfCards += targets[0].number;
            else sumOfCards += targets.reduce((a, t) => a + t.number, 0);
            // check which house is being made
            let houseBeingMade = null
            for (let i = 9; i <= 13; ++i) {
                if (sumOfCards % i === 0) {
                    houseBeingMade = i
                    break
                }
            }
            if (houseBeingMade === null) throw Game.ERROR.InvalidPlayError

            // check if player has the house card they are trying to make
            if (!player.hasCard(houseBeingMade)) throw Game.ERROR.InvalidPlayError

            return houseBeingMade
        } else {
            let house = targets.filter(t => t.house)
            let restOfCards = targets.filter(t => t.number)
            let sumOfCards = restOfCards.reduce((a, c) => a + c.number, 0)

            // Can only be one house
            if (house.length !== 1) throw Game.ERROR.InvalidPlayError

            // increasing a weak house
            player.checkMakeHouse(house[0].house + playNumber)
            if ((sumOfCards + playNumber + house[0].house) % (house[0].house + playNumber) !== 0) throw Game.ERROR.InvalidPlayError
            // let restOfCardsNumbers = restOfCards.map(c => c.number)
            // let possibleCombos = this.getPossibleSubsetSum(restOfCardsNumbers, house.number)
            // if (possibleCombos.length === 0) throw Game.ERROR.InvalidPlayError
            return house[0].house
        }

        return undefined
    }

    executeHousePlay(player, turn, house) {
        let stackCards = [turn.target, turn.play.card].flat();

        let existingHouseInStackCard = stackCards.filter(s => s.house)

        if (existingHouseInStackCard.length > 1) throw Game.ERROR.InvalidPlayError

        let stack;
        if (existingHouseInStackCard.length === 1) {
            stack = this.floor.find(f => f.house === house);
            let onlyCards = stackCards.filter(s => s.number)
            player.removeHouseMade(stack.house)
            stack.increaseHouse(onlyCards)
        } else {
            stack = new Stack(house, stackCards);
            this.addCardToFloor(stack);
            turn.target.forEach(t => this.removeFromFloor(t));
        }

        player.addHouseMade(stack.house);
        player.removeFromHand(turn.play);

        this.organizeFloor(house);
    }

    executeLooseThrow(player, turn) {
        let number = turn.play.number
        let hasPicked = false

        // thorw card
        player.removeFromHand(turn.play.card)

        // pick any house which match number
        let houseInFloor = this.findHouseInFloor(number)
        if (houseInFloor) {
            hasPicked = true
            player.pickFromFloor(houseInFloor)
            this.removeFromFloor(houseInFloor)
        }

        // pick direct cards outright
        let directPicks = this.floor.filter(f => f.number && f.number === number)
        directPicks.forEach(d => {
            hasPicked = true
            player.pickFromFloor(d)
            this.removeFromFloor(d)
        })

        // try pick loose cards
        let organizeFloor = this.floor.filter(f => f.number).map(f => f.number)
        let possiblePicks = this.getPossibleSubsetSum(organizeFloor, number)

        possiblePicks.forEach(p => {
            if (p.every(s => this.floor.findIndex(f => f.number === s) !== -1)) {
                p.forEach(s => {
                    hasPicked = true
                    let target = this.floor.find(f => f.number === s)
                    player.pickFromFloor(target)
                    this.removeFromFloor(target)
                })
            }
        })

        // pick the thrown card if there has been a pick
        if (hasPicked) {
            player.pickFromHand(turn.play.card)
        } else {
            this.addCardToFloor(turn.play.card)
        }
    }

    addCardToFloor(card) {
        this.floor = this.floor.concat(card)
    }

    executePick(player, turn) {
        let partner = this.getPlayerPartner(player)
        player.removeFromHand(turn.play.card)
        player.pickFromHand(turn.play.card)
        player.removeHouseMade(turn.play.number)
        partner.removeHouseMade(turn.play.number)
        turn.target.forEach(target => player.pickFromFloor(target))
        turn.target.forEach(target => this.removeFromFloor(target))
        this.checkPickFloor(player, turn.play.number)
    }

    isValidPick(player, number, targets) {
        let partner = this.getPlayerPartner(player)

        // validate targets in floor
        if (!targets.every(t => this.findInFloor(t)))
            throw Game.ERROR.InvalidPlayError

        if (targets.length > 1) {
            // only one house in multiple pick
            let house = targets.filter(t => t.house)
            if (house.length > 1) throw Game.ERROR.InvalidPlayError

            // if there's a house it must be same as number and within player's pick
            if (house.length === 1 && house[0].house !== number && (player.canPickHouse(house) || partner.canPickHouse(house)))
                throw Game.ERROR.InvalidPlayError
        }

        //  filter out only cards
        let onlyCards = targets.filter(t => t.number).map(t => t.number)

        if (onlyCards.length === 0) return true

        // any card cannot be greater than the pick number
        if (onlyCards.some(c => c > number)) throw Game.ERROR.InvalidPlayError

        // basic sum check
        if ((onlyCards.reduce((c1, c2) => c1 + c2) % number) !== 0) throw Game.ERROR.InvalidPlayError

        // remove the same value and sort in descending order
        onlyCards = onlyCards.filter(c => c !== number)

        if (onlyCards.length !== 0) {
            // find all possible subsets
            let sumSubsets = this.getPossibleSubsetSum(onlyCards, number)

            // try to remove all cards from the subsets
            sumSubsets.forEach(subset => {
                if (subset.every(s => onlyCards.findIndex(o => o === s) !== -1)) {
                    subset.forEach(s => {
                        let index = onlyCards.findIndex(o => o === s)
                        onlyCards.splice(index, 1)
                    })
                }
            })

        }

        if (onlyCards.length !== 0) throw Game.ERROR.InvalidPlayError

        return true
    }

    getPossibleSubsetSum(numbers, target) {
        numbers = numbers.sort()
        let response = []

        function getPossibleSubset(numbers, target, partial) {
            let sum, n, remaining

            partial = partial || []

            // sum partial
            sum = partial.reduce((a, b) => a + b, 0)

            // check if the partial sum is equals to target
            if (sum === target) {
                response.push(partial)
            }

            if (sum >= target) {
                return // if we reach the number why bother to continue
            }

            for (var i = 0; i < numbers.length; i++) {
                n = numbers[i]
                remaining = numbers.slice(i + 1)
                getPossibleSubset(remaining, target, partial.concat([n]))
            }
        }

        getPossibleSubset(numbers, target)

        let stringArray = response.map(JSON.stringify);
        let uniqueStringArray = new Set(stringArray);
        let uniqueArray = Array.from(uniqueStringArray, JSON.parse);

        uniqueArray = uniqueArray.sort((u1, u2) => u1.length > u2.length ? 1 : -1)

        return uniqueArray
    }

    sumOfTargets(targets) {
        return targets.reduce((a, t) => {
            let value = t.house ? t.house : t.number
            return a + value
        }, 0)
    }

    /**
     * Handles the floor after a house has been made
     * 
     * @param {int} house - the house number which was just made
     */
    organizeFloor(house) {
        let stack = this.findHouseInFloor(house)
        let numbers = this.floor.filter(f => f.number).map(f => f.number);
        let possibleHouses = this.getPossibleSubsetSum(numbers, house);

        possibleHouses.forEach(subset => {
            if (subset.every(s => this.floor.findIndex(f => f.number === s) !== -1)) {
                let newStack = [];
                subset.forEach(s => {
                    let target = this.floor.find(f => f.number === s);
                    this.removeFromFloor(target);
                    newStack.push(target);
                })
                stack.addCards(newStack)
            }
        })
    }

    // try to pick everything of the number
    checkPickFloor(player, number) {
        let houses = this.floor.filter(f => f.house && f.house === number)
        let onlyCards = this.floor.map(f => f.number)
        let partner = this.getPlayerPartner(player)

        houses.forEach(h => {
            player.pickFromFloor(h)
            this.removeFromFloor(h)
            player.removeHouseMade(h)
            partner.removeHouseMade(h)
        })

        // find all possible subsets
        let sumSubsets = this.getPossibleSubsetSum(onlyCards, number)

        // try to remove all cards from the subsets
        sumSubsets.forEach(subset => {
            if (subset.every(s => this.floor.findIndex(f => f.number === s || f.house === s) !== -1)) {
                subset.forEach(s => {
                    let target = this.floor.find(f => f.number === s || f.house === s)
                    player.pickFromFloor(target)
                    this.removeFromFloor(target)
                })
            }
        })
    }

    findInFloor(target) {
        return this.floor.find(f => {
            if (f.suit && f.number)
                return f.suit === target.suit && f.number === target.number
            if (f.house)
                return f.house === target.house
            return false
        })
    }

    findHouseInFloor(house) {
        return this.floor.find(f => {
            if (f.house)
                return f.house === house
            return false
        })
    }

    removeFromFloor(target) {
        let indexToRemove = this.floor.findIndex(f => {
            if (f.suit && f.number)
                return f.suit === target.suit && f.number === target.number
            if (f.house)
                return f.house === target.house
            return false
        })
        if (indexToRemove === -1) throw new Error('Target not in floor.')
        this.floor.splice(indexToRemove, 1)
    }

}

module.exports = Game