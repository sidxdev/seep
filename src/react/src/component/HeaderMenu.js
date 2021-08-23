import React, { Component } from 'react'
import { Menu } from 'semantic-ui-react'
import { Link } from 'react-router-dom'

export class HeaderMenu extends Component {
  state = { }

  handleItemClick = (e, { name }) => this.setState({ activeItem: name })

  render() {
    const { activeItem } = this.state

    return (
      <Menu>
        <Menu.Item
          name='home'
          active={activeItem === 'home'}>
          <Link to="/">Home</Link>
        </Menu.Item>
        <Menu.Item
          name='about'
          active={activeItem === 'about'}>
          <Link to="/about">About</Link>
        </Menu.Item>
      </Menu>
    )
  }
}