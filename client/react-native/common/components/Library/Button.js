import React from 'react'
import { TouchableOpacity } from 'react-native'
import { Text } from '../Library'
import { colors } from '../../constants'

const Button = ({
  height,
  width,
  onPress,
  children,
  backgroundColor,
  color,
  style,
}) => (
  <TouchableOpacity
    style={[
      {
        height,
        width,
        backgroundColor: backgroundColor || colors.black,
        borderRadius: 24,
      },
      style,
    ]}
    onPress={onPress}
  >
    <Text
      style={[{ height }]}
      middle
      center
      icon='plus'
      color={color || colors.white}
    >
      {children}
    </Text>
  </TouchableOpacity>
)

export default Button
