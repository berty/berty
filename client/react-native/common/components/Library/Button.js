import React from 'react'
import { Text } from '../Library'

const Button = ({ style, ...props }) => (
  <Text button opacity={props.onPress ? 1 : 0.3} {...props} />
)

export default Button
