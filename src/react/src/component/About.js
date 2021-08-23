import React, { Component } from 'react';
import { Grid, Header, Segment } from 'semantic-ui-react'
import { Link } from 'react-router-dom'


import preval from 'preval.macro'
const dateTimeStamp = preval`module.exports = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });`


export class About extends Component {
  render = () => (
    <Grid.Column textAlign='center'>
      <Segment basic>
        I would like to deidcate this to my playing card buddies in office.
        May players all over the world have a smooth bug-free ad-less experince at this wonderful game.
    </Segment>
      <Segment basic>
        <Header>Build Date: {dateTimeStamp}</Header>
        <Link to='/'>Go Home</Link>
      </Segment>

      <Segment.Group>
        <Segment>
          <Header>Credits</Header>
        </Segment>

        <Segment>
          Icons made by <a href="https://www.flaticon.com/authors/freepik" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a>
        </Segment>
        <Segment>
          Playing Cards from <a href="https://github.com/htdebeer/SVG-cards" title="SVG-Cards">SVG-Cards</a>
        </Segment>
      </Segment.Group>
    </Grid.Column>
  )
}