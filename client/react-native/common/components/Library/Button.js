import React from 'react'
import { TouchableOpacity } from 'react-native'
import { Text } from '../Library'

const Button = ({ onPress, ...props }) => (
  <TouchableOpacity onPress={onPress}>
    <Text {...props} />
  </TouchableOpacity>
)

export default Button
