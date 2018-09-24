import React, { PureComponent } from 'react'
import { TouchableOpacity, Image } from 'react-native'
import { colors } from '../../constants'
import { Flex, Text } from '.'
import { marginLeft, padding } from '../../styles'

export default class ListItem extends PureComponent {
  render () {
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
        ]}
      >
        <Flex.Cols align='center'>
          <Flex.Rows size={1} align='center'>
            <Image
              style={{ width: 40, height: 40, borderRadius: 20 }}
              source={{
                uri: 'https://api.adorable.io/avatars/285/' + title + '.png',
              }}
            />
          </Flex.Rows>
          <Flex.Rows
            size={7}
            align='stretch'
            justify='center'
            style={[marginLeft]}
          >
            <Text color={colors.black} left middle ellipsis>
              {title}
            </Text>
            <Text color={colors.subtleGrey} tiny middle left ellipsis>
              {subtitle}
            </Text>
          </Flex.Rows>
        </Flex.Cols>
      </TouchableOpacity>
    )
  }
}
