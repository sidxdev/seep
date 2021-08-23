import React, { Component } from 'react';
import { Grid, Header, Segment, Menu, Button, Modal } from 'semantic-ui-react'
import { NavButton } from './NavButton';
import GameService from './GameService';
import { PlayingCards } from './PlayingCards';
import { Link } from 'react-router-dom'
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { SERVERS, REFRESH_TIME_MS } from '../config.json'

export class Game extends Component {

    constructor(props) {
        super(props)

        let server = process.env.NODE_ENV === 'production' ? SERVERS[0] : 'http://localhost:1234';

        this.state = {
            game: new GameService(server),
            error: null,
            leaveGameModalOpen: false,
            toastVisible: false,
            toastText: '',
            selectedFloorCardsIndex: [],
            selectedHandCardIndex: []
        }

        this.refresh = null
    }

    async componentDidMount() {
        try {
            await this.state.game.newGame()
            this.setState({ game: this.state.game })
            this._startRefresh()
        } catch (error) {
            // only remove game id for the possibility of bad network etc
            // so player can rejoin
            window.localStorage.removeItem('gameId')
            this.setState({ error })
        }
    }

    componentWillUnmount() {
        this._stopRefresh()
        window.localStorage.removeItem('gameId')
    }

    async _startRefresh() {
        this._stopRefresh()

        const that = this;

        let game = await that.state.game.refresh()
        if (game) {
            that.setState({ game: that.state.game })
        } else {
            this.setState({ error: true })
        }


        this.refresh = setInterval(async () => {
            let game = await that.state.game.refresh()
            if (game) {
                that.setState({ game: that.state.game })
            } else {
                this.setState({ error: true })
                that._stopRefresh()
            }
        }, REFRESH_TIME_MS);
    }

    _stopRefresh() {
        if (this.refresh) clearInterval(this.refresh)
        this.refresh = null
    }

    _GameLoadingScreen = () => (
        <Header>Creating game...</Header>
    )

    _GameLoadFailScreen = () => (
        <div>
            <Header>Game loading failed. Please try again later.</Header>
            <Link to='/'>Go Home</Link>
        </div>
    )

    _GameScreen = () => (
        <div>
            <Menu icon='labeled' text widths={2} size="mini">
                <Menu.Item content={`Game ${this.state.game.gameId}`} />
                <Menu.Item position='right'>
                    <Modal basic
                        onClose={() => this.setState({ leaveGameModalOpen: false })}
                        onOpen={() => this.setState({ leaveGameModalOpen: true })}
                        open={this.state.leaveGameModalOpen}
                        size='small'
                        trigger={<Button fluid basic color='red' content="Leave Game" />}>
                        <Modal.Content style={{ textAlign: 'center' }}>
                            Are you sure you want to leave the game?
                        </Modal.Content>
                        <Modal.Actions className='center-items'>
                            <Button basic color='green' content='No' inverted onClick={() => this.setState({ leaveGameModalOpen: false })} />
                            <NavButton label='Yes' route='/' color='red' inverted />
                        </Modal.Actions>
                    </Modal>
                </Menu.Item>
            </Menu>
            <Grid.Column textAlign='center' verticalAlign='middle' style={{ minHeight: '90vh' }}>
                {this._GameStateResolvedScreen()}
            </Grid.Column>
        </div>
    )

    _GameStateResolvedScreen = () => {
        switch (this.state.game.state) {
            case 'LOBBY': return this._GameStateScreenLobby()
            case 'DEALING': return this._GameStateScreenDealing()
            case 'FIRSTTURN': return this._GameStateScreenFirstTurn()
            case 'PLAYING': return this._GameStateScreenPlaying()
            case 'COMPLETE': return this._GameStateScreenComplete()
            default: return <div />
        }
    }

    _GameStateScreenLobby = () => (
        <Segment raised style={{ minHeight: 'inherit' }} className='center-items'>
            <Header /><Header />
            <Header>Waiting for players to join...</Header>
            <Header>
                <CopyToClipboard text={`${window.location.origin}/joingame/${this.state.game.gameId}`}
                    onCopy={() => this.showToast('Invite link copied!')}>
                    <Button basic icon='game' content='Invite to Game' />
                </CopyToClipboard>
            </Header>
            <Header /><Header />
        </Segment>
    )

    _GameStateScreenDealing = () => (
        <div>
            <Segment style={{ minHeight: '60vh' }} inverted color='olive' className='center-items'>
                <Header size='tiny'>{this.state.game.isTurn ? 'Pick a house' : 'Player 1 is picking a house'}</Header>
            </Segment>
            <Segment style={{ minHeight: '27vh' }} inverted color='grey' className='center-items'>
                <PlayingCards cards={this.state.game.self.cards}
                    onSelectedCard={(selectedIndex) => this.setState({ selectedHandCardIndex: selectedIndex })} />
            </Segment>
        </div>
    )

    _GameStateScreenPlaying = () => (
        <div>
            <Segment style={{ minHeight: '60vh' }} inverted color='olive'>
                <Header size='tiny' content='Floor' />
            </Segment>
            <Segment style={{ minHeight: '20vh' }} inverted color='grey'>
                <Header size='tiny' content='Your Cards' />
            </Segment>
        </div>
    )

    showToast = (message) => {
        const that = this;
        this.setState({ toastText: message, toastVisible: true })
        setTimeout(() => that.setState({ toastVisible: false }), 1500)
    }

    render = () => (
        <Grid.Column verticalAlign='middle'>
            {this.state.error ?
                this._GameLoadFailScreen() :
                (this.state.game.loaded ?
                    this._GameScreen() :
                    this._GameLoadingScreen())}
            <Modal basic open={this.state.toastVisible}>
                <Modal.Content content={this.state.toastText} style={{ textAlign: 'center' }} />
            </Modal>
        </Grid.Column>
    )
};