import React, { PureComponent } from 'react'
import { Platform, TextInput as TextInputNative } from 'react-native'

export default class TextInputMultilineFix extends PureComponent {
  state = {
    multiline: false,
  }

  render () {
    return (
      <TextInputNative
        {...this.props}
        onFocus={() => {
          Platform.OS === 'android' &&
          this.props.multiline &&
          this.setState({ multiline: true })
          return this.props.onFocus && this.props.onFocus()
        }}
        onBlur={() => {
          Platform.OS === 'android' &&
          this.props.multiline &&
          this.setState({ multiline: true })
          return this.props.onBlur && this.props.onBlur()
        }}
        multiline={
          Platform.OS === 'android'
            ? this.state.multiline
            : this.props.multiline
        }
      />
    )
  }
}
