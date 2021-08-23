import React, { Component } from 'react';
import { Grid, Header } from 'semantic-ui-react'
import { withRouter, Link } from 'react-router-dom'
import GameService from './GameService'
import { SERVERS } from '../config.json'

class JoinGame extends Component {
    state = { id: null, error: false }
    async componentDidMount() {
        const { id } = this.props.match.params;
        this.setState({ text: `Joining game ${id}...` })

        let server = process.env.NODE_ENV === 'production' ? SERVERS[0] : 'http://localhost:1234';
        let game = new GameService(server)

        try {
            await game.joinGame(id)
            this.props.history.push('/game')
        } catch (error) {
            this.setState({ text: 'Error joining game.', error: true })
        }
    }

    render = () => {
        return <Grid.Column textAlign='center' verticalAlign='middle'>
            {this.state.text ? <Header>{this.state.text}</Header> : <div />}
            {this.state.error ? <Link to='/'>Go Home</Link> : <div />}
        </Grid.Column>
    }
};

export default withRouter(JoinGame)