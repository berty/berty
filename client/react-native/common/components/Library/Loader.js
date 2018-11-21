import { ActivityIndicator } from 'react-native'
import React from 'react'

import { Flex, Text } from './'

const Loader = ({ message, color, background, size }) => (
  <Flex.Rows
    align='center'
    justify='center'
    style={{ backgroundColor: background }}
  >
    <ActivityIndicator size={size || 'large'} color={color} />
    {message && (
      <Text
        size={0}
        {...(size ? { [size]: true } : { large: true })}
        color={color}
      >
        {message}
      </Text>
    )}
  </Flex.Rows>
)

export default Loader
