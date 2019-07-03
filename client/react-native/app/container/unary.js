import { Component } from 'react'

export class Unary extends Component {
  state = {
    loading: true,
    response: null,
  }

  componentDidMount() {
    this.invoke()
  }

  get request() {
    return this.props.request || {}
  }

  invoke = () =>
    this.setState({ loading: true }, async () =>
      this.setState({
        response: await this.method(this.request),
        loading: false,
      })
    )

  render() {
    if (
      this.props.fallback &&
      this.state.loading &&
      this.state.response == null
    ) {
      return this.props.fallback
    }
    return this.props.children({ ...this.state, retry: this.invoke })
  }
}
