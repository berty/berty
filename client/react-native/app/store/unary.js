import { debounce } from 'throttle-debounce'

import { Component } from 'react'

export class Unary extends Component {
  state = {
    response: null,
  }

  componentDidMount () {
    this.invoke()
  }

  componentDidReceiveProps () {
    this.invoke()
  }

  invoke = debounce(100, async () => {
    const response = await this.service(this.request)
    this.setState({ response })
  })

  render () {
    if (this.state.response == null) {
      return this.props.fallback
    }
    return this.props.children(this.state.response)
  }
}
