import { Component } from 'react'
import { deepEqual, deepFilterEqual } from './helper'

export class Entity extends Component {
  componentDidMount() {
    if (this.entity == null) {
      this.fetch()
    }
  }

  componentWillReceiveProps(props) {
    if (!deepEqual(props, this.props) || this.entity == null) {
      this.fetch()
    }
  }

  get entity() {
    const { context, children, id, ...filter } = this.props

    if (id) {
      return this.store.get(id)
    }
    for (const [, data] of this.store) {
      if (deepFilterEqual(filter, data)) {
        return this.store.get(data.id)
      }
    }
    return null
  }

  render() {
    const { children } = this.props
    if (this.entity) {
      return children(this.entity)
    }
    return children()
  }
}

export default Entity
