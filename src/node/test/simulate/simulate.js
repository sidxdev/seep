const server = "http://localhost:1234"
const ADMIN_KEY = '123456'

let element

const gameRefresh = async () => {
    let gameId = element.gameIdInput.get(0).children[1].value
    if (gameId === '') return

    let game = await fetch(`${server}/game/${gameId}`, {
        method: 'GET',
        headers: { 'x-admin-key': ADMIN_KEY }
    })

    if (game.ok) {
        element.gameIdInput.removeClass('error')
        let json = await game.json()
        populateData(json)
    } else {
        element.gameIdInput.addClass('error')
        element.gameState.text('Game ID not found.')
        resetData()
    }
}

const floorElementClickHandler = event => {
    const item = $(event.target).find("i")
    item.toggleClass('right triangle')
}

const playerCardClickHandler = event => {
    const list = $(event.currentTarget).find("i")
    list.removeClass('right triangle')

    const item = $(event.target).find("i")
    item.addClass('right triangle')
}

const turnClickHandler = async event => {
    const intent = $(event.target).attr('data-intent')
    const player = $(event.currentTarget.parentElement)
    const play = player.children().eq(1).find(".right.triangle")
    if (play.length !== 1) return
    const target = element.floor.children().find(".right.triangle")

    let turn = {
        play: {
            suit: play[0].getAttribute('data-suit').toUpperCase(),
            number: parseInt(play[0].getAttribute('data-number'))
        },
        intent,
        target: target.map((i, t) => {
            let isHouse = t.hasAttribute('data-house');
            if (isHouse) {
                return {
                    type: 'HOUSE',
                    house: parseInt(t.getAttribute('data-house'))
                }
            } else {
                return {
                    type: 'CARD',
                    suit: t.getAttribute('data-suit').toUpperCase(),
                    number: parseInt(t.getAttribute('data-number'))
                }
            }
        }).get()
    }

    const gameId = element.gameIdInput.get(0).children[1].value

    let response = await fetch(`${server}/game/${gameId}/play`, {
        method: 'POST',
        body: JSON.stringify({
            playerId: player.attr('data-playerId'),
            turn
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    if (response.ok) {
        gameRefresh()
    } else {
        handleError()
    }
}

const selectHouseClickHandler = async event => {
    const player = $(event.currentTarget.parentElement)
    const play = player.children().eq(1).find(".right.triangle")
    if (play.length !== 1) return

    let turn = {
        playerId: player.attr('data-playerId'),
        house: parseInt(play[0].getAttribute('data-number'))
    }

    const gameId = element.gameIdInput.get(0).children[1].value

    let response = await fetch(`${server}/game/${gameId}/house`, {
        method: 'POST',
        body: JSON.stringify(turn),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    if (response.ok) {
        gameRefresh()
    } else {
        let json = await response.json()
        handleError(json.error)
    }
}

const newGame = async event => {
    let game = await fetch(`${server}/game`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })

    if (game.ok) {
        const json = await game.json()
        const gameId = json.gameId
        await Promise.all([
            fetch(`${server}/game/${gameId}/join`, { method: 'POST' }),
            fetch(`${server}/game/${gameId}/join`, { method: 'POST' }),
            fetch(`${server}/game/${gameId}/join`, { method: 'POST' }),
            fetch(`${server}/game/${gameId}/join`, { method: 'POST' })
        ])
        element.gameIdInput.get(0).children[1].value = gameId
        gameRefresh()
    } else {
        return handleError()
    }
}

const handleError = error => {
    element.errorModal.modal('show')
    element.errorModal.children().eq(0).text(`Invalid Turn: ${error}`)
}

$(document).ready(function () {
    element = {
        refreshButton: $('#refresh-button'),
        newGameButton: $('#new-game-button'),
        floor: $('#list-floor'),
        player1: $('#player1'),
        player2: $('#player2'),
        player3: $('#player3'),
        player4: $('#player4'),
        gameIdInput: $('#game-id'),
        gameState: $('#game-state'),
        errorModal: $('#error-modal')
    }
    // register game refresh button
    element.refreshButton.click(gameRefresh)
    // register new game button
    element.newGameButton.click(newGame)
});


const resetData = () => {
    element.floor.empty()
    element.player1.children().eq(1).empty()
    element.player2.children().eq(1).empty()
    element.player3.children().eq(1).empty()
    element.player4.children().eq(1).empty()
    element.player1.children().eq(6).empty()
    element.player2.children().eq(5).empty()
    element.player3.children().eq(5).empty()
    element.player4.children().eq(5).empty()
}


const populateData = json => {
    resetData()
    // set state
    element.gameState.text(json.state)
    // set floor
    json.floor.forEach(f => {
        if (f.house) element.floor.append(house(f))
        else element.floor.append(card(f.number, f.suit))
    })
    element.floor.unbind('click')
    element.floor.click(floorElementClickHandler)
    // set player cards
    json.players.forEach((p, i) => {
        const player = element["player" + (i + 1)]
        player.attr("data-playerId", p.id)
        p.cards.forEach(c => {
            player.children().eq(1).append(card(c.number, c.suit))
        })
        player.children().eq(1).unbind('click')
        player.children().eq(1).click(playerCardClickHandler)
        p.picked.forEach(c => {
            if (i === 0) player.children().eq(6).append(card(c.number, c.suit))
            else player.children().eq(5).append(card(c.number, c.suit))
        })
        // set active player
        if (p.id === json.currentPlayerTurn) {
            player.children().eq(0).children().eq(0).addClass("green")
            player.children().eq(2).show()
            player.children().eq(2).unbind("click")
            player.children().eq(3).show()
            player.children().eq(3).unbind("click")
            if (json.state === 'DEALING') {
                // select house
                player.children().eq(2).hide()
                player.children().eq(3).hide()
                player.children().eq(4).click(selectHouseClickHandler)
            } else {
                player.children().eq(2).click(turnClickHandler)
                player.children().eq(3).click(turnClickHandler)
                if (i === 0) player.children().eq(4).hide()
            }
        } else {
            player.children().eq(0).children().eq(0).removeClass("green")
            player.children().eq(2).hide()
            player.children().eq(3).hide()
        }
    })

}

const card = (number, suit) => {
    let suitStyle
    switch (suit) {
        case "Spades": suitStyle = '&#9824;'; break
        case "Hearts": suitStyle = '&#9829;'; break
        case "Clubs": suitStyle = '&#9827;'; break
        case "Diamonds": suitStyle = '&#9830;'; break
    }

    return `<div class="item">
        <a class="ui image label">
            <i class="icon" data-suit='${suit}' data-number='${number}'></i>
            <img src="/asset/image/${suit}.png"/>
            ${number}
        </a>
    </div>`
}

const house = (house) => {
    return `<div class="item">
        <a class="ui label">
            <i class="icon" data-house='${house.house}'></i>
            ${house.isStrong ? 'Strong' : 'Weak'} ${house.house}
        </a>
    </div>`
}