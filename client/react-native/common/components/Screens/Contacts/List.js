import React, { PureComponent } from 'react'
import { Flex, Text } from '../../Library'

export default class List extends PureComponent {
  render () {
    return (
      <Flex.Grid>
        <Text>Hello World !</Text>
      </Flex.Grid>
    )
  }
}
