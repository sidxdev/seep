import React, { Component } from 'react'
import { Grid, Header, Input, Card, Segment, Image } from 'semantic-ui-react'
import { NavButton } from './NavButton'
import logo from '../logo.svg';

export class Home extends Component {
  state = {
    joinGameButtonDisabled: true,
    joinGameValue: ''
  }

  render = () => (
    <Grid.Column style={{ maxWidth: '600px' }} verticalAlign='middle'>

      <Segment textAlign='center'>
        <Header as='h2' textAlign='center'>
          Play Seep!
        </Header>
        <Image src={logo} fluid alt="logo" />

        <Card fluid>
          <NavButton label='New Game' route='/game' />
        </Card>

        <Card fluid>
          <Input
            value={this.state.joinGameValue}
            type='number'
            onChange={(event, { value }) => {
              this.setState({ joinGameButtonDisabled: value.toString().length !== 6, joinGameValue: value })
            }}
            action={<NavButton
              label='Join Game' route={`/joingame/${this.state.joinGameValue}`}
              disabled={this.state.joinGameButtonDisabled}
            />}
            actionPosition='right'
            placeholder='Game ID...'
            fluid />
        </Card>
      </Segment>

      <Segment>
        <Card fluid>
          <NavButton label='About' route='/about' />
        </Card>
      </Segment>

    </Grid.Column>
  )
}