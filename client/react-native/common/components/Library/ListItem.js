import React, { PureComponent } from 'react'
import { TouchableOpacity, Image } from 'react-native'
import { colors } from '../../constants'
import { Flex, Text } from '.'
import { marginHorizontal } from '../../styles'

export default class ListItem extends PureComponent {
  render () {
    const { title, subtitle, onPress } = this.props
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[
          {
            backgroundColor: colors.white,
            paddingVertical: 16,
            height: 72,
          },
          marginHorizontal,
        ]}
      >
        <Flex.Cols align='left'>
          <Flex.Rows size={1} align='left' style={{ marginLeft: 30 }}>
            <Image
              style={{ width: 40, height: 40, borderRadius: 50 }}
              source={{
                uri: 'https://api.adorable.io/avatars/285/' + title + '.png',
              }}
            />
          </Flex.Rows>
          <Flex.Rows size={6} align='left' style={{ marginLeft: 14 }}>
            <Text color={colors.black} left middle>
              {title}
            </Text>
            <Text color={colors.subtleGrey} tiny>
              {subtitle}
            </Text>
          </Flex.Rows>
        </Flex.Cols>
      </TouchableOpacity>
    )
  }
}
