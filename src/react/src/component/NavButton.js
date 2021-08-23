import React, { Component } from 'react'
import { Button } from 'semantic-ui-react'
import { withRouter } from 'react-router-dom'


export class NavButton extends Component {
    render() {
        const { label, route, ...props } = this.props

        const NavButtonWithRouter = withRouter(({ history }) => (
            <Button content={label} onClick={() => { history.push(route) }} {...props} />
        ))

        return <NavButtonWithRouter />
    }
}