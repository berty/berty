import { Component } from 'react'

export class Entity extends Component {
  render () {
    const { children } = this.props
    if (this.entity) {
      return children(this.entity)
    }
    this.fetch()
    return children()
  }
}

export default Entity
