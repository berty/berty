import * as React from 'react'
import { StyleSheet, View } from 'react-native'
import { colors } from '../../constants'

class Separator extends React.Component {
  static defaultProps = {
    vertical: false,
  }

  shouldComponentUpdate () {
    return false
  }

  render () {
    const { vertical, highlighted } = this.props
    const keyStyle = vertical ? 'width' : 'height'
    return (
      <View
        style={[
          {
            [keyStyle]: StyleSheet.hairlineWidth,
            backgroundColor: colors.borderGrey,
          },
          highlighted && { marginLeft: 0 },
          this.props.style,
        ]}
      />
    )
  }
}

export default Separator
