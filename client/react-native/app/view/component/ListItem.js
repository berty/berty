import React, { PureComponent } from 'react'
import { TouchableOpacity } from 'react-native'
import { colors } from '@berty/common/constants'
import Flex from './Flex'
import Text from './Text'
import Avatar from './Avatar'
import { marginLeft, padding, borderBottom } from '@berty/common/styles'

export default class ListItem extends PureComponent {
  render() {
    const { title, subtitle, onPress } = this.props
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[
          {
            backgroundColor: colors.white,
            height: 72,
          },
          padding,
          borderBottom,
        ]}
      >
        <Flex.Cols align="center">
          <Flex.Rows size={1} align="center">
            <Avatar data={this.props} size={40} />
          </Flex.Rows>
          <Flex.Rows
            size={7}
            align="stretch"
            justify="center"
            style={[marginLeft]}
          >
            <Text color={colors.black} left middle>
              {title}
            </Text>
            <Text color={colors.subtleGrey} tiny middle left>
              {subtitle}
            </Text>
          </Flex.Rows>
        </Flex.Cols>
      </TouchableOpacity>
    )
  }
}
