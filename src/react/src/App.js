import React, { Component } from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import './App.css';
import 'semantic-ui-css/semantic.min.css'
import { Home, About, Page404, Game, JoinGame } from './component'
import { Grid, Container } from 'semantic-ui-react'

export default class App extends Component {

  render = () => (
    <Container>
      <Grid centered style={{ height: '100vh' }}>
        <Router>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/game" component={Game} />
            <Route exact path="/joingame/:id" component={JoinGame} />
            <Route exact path="/about" component={About} />
            <Route exact path="*" component={Page404} />
          </Switch>
        </Router>
      </Grid>
    </Container>

  )
}
