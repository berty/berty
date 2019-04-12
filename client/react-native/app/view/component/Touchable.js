import React, { PureComponent } from 'react'
import { TouchableOpacity } from 'react-native'

export default class Touchable extends PureComponent {
  state = {
    loading: false,
  }

  preventDoubleClicking = onPress => () => {
    this.setState({ loading: true }, async () => {
      if (!onPress) {
        return
      }
      await onPress()
      this.setState({ loading: false })
    })
  }

  render () {
    const { loading } = this.state
    const {
      style = {},
      onPress,
      opacity,
      activeOpacity = 0.3,
      ...props
    } = this.props
    style.opacity = opacity || onPress ? 1 : activeOpacity
    return (
      <TouchableOpacity
        onPress={!loading ? this.preventDoubleClicking(onPress) : undefined}
        activeOpacity={activeOpacity}
        style={style}
        {...props}
      />
    )
  }
}
