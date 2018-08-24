import React, { PureComponent } from 'react'
import { Flex, Text } from '../../Library'

export default class List extends PureComponent {
  render () {
    return (
      <Flex.Grid
        style={{ height: '1000' }}
        flex={1}
        justifyContent='center'
        alignItems='center'
      >
        <Text>Hello World !</Text>
      </Flex.Grid>
    )
  }
}
