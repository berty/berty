import { ActivityIndicator } from 'react-native'
import React from 'react'

import Flex from './Flex'
import Text from './Text'
import { colors } from '../../constants'

const Loader = ({ message, color, background, size }) => (
  <Flex.Cols align='center' justify='center'>
    <Flex.Rows
      align='center'
      justify='center'
      style={{ backgroundColor: background || colors.transparent }}
    >
      <ActivityIndicator size={size || 'large'} color={color} />
      {message && (
        <Text {...(size ? { [size]: true } : { large: true })} color={color}>
          {message}
        </Text>
      )}
    </Flex.Rows>
  </Flex.Cols>
)

export default Loader
