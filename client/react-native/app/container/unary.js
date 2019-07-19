import { Component } from 'react'
import { debounce } from 'throttle-debounce'

export class Unary extends Component {
  state = {
    loading: true,
    response: null,
  }

  componentDidMount() {
    this.invokeDebounce()
  }

  get request() {
    return this.props.request || {}
  }

  componentWillReceiveProps(props) {
    this.invokeDebounce()
  }

  invoke = () =>
    this.setState({ loading: true }, async () => {
      this.setState({
        response: await this.method(this.request),
        loading: false,
      })
    })
  invokeDebounce = debounce(100, this.invoke)

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
