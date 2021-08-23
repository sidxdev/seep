import React, { Component } from 'react';
import { Grid, Header } from 'semantic-ui-react'
import { Link } from 'react-router-dom'

export class Page404 extends Component {
  render = () => (
    <Grid.Column textAlign='center' verticalAlign='middle'>
      <Header>All those who wander are not lost!</Header>
      <Link to='/'>Go Home</Link>
    </Grid.Column>
  )
};