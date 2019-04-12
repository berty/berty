import { Keyboard } from 'react-native'
import React from 'react'

const KeyboardContext = React.createContext({ keyboardVisible: false })

export const Consumer = KeyboardContext.Consumer

export class Provider extends React.PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      keyboardVisible: false,
    }
  }

  componentDidMount () {
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () =>
      this._keyboardDidShow()
    )
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () =>
      this._keyboardDidHide()
    )
  }

  componentWillUnmount () {
    this.keyboardDidShowListener.remove()
    this.keyboardDidHideListener.remove()
  }

  _keyboardDidShow () {
    this.setState({ keyboardVisible: true })
  }

  _keyboardDidHide () {
    this.setState({ keyboardVisible: false })
  }

  render () {
    return (
      <KeyboardContext.Provider value={this.state}>
        {this.props.children}
      </KeyboardContext.Provider>
    )
  }
}
