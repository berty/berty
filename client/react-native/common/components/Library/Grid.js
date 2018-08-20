import React from 'react'
import { View } from 'react-native'

export const Block = ({
  flex,
  flexDirection,
  alignItems,
  alignSelf,
  justifyContent,
  children = null,
  style = {},
  ...props
}) => (
  <View
    style={[
      { flex, flexDirection, alignItems, alignSelf, justifyContent },
      style
    ]}
    {...props}
  >
    {children}
  </View>
)

export const Grid = props => (
  <Block
    flexDirection={'column'}
    alignItems={'center'}
    justifyContent={'space-between'}
    {...props}
  />
)

export const Row = ({ flexDirection, ...props }) => (
  <Block
    flexDirection={'row'}
    alignItems={'center'}
    justifyContent={'space-between'}
    {...props}
  />
)

export const Col = props => (
  <Block
    flexDirection={'column'}
    alignItems={'center'}
    justifyContent={'space-between'}
    {...props}
  />
)

export default {
  Row,
  Col
}
