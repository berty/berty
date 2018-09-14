import React, { PureComponent } from 'react'
import { Text, Flex } from '../../../Library'

export default class ByBump extends PureComponent {
  render () {
    return (
      <Flex.Cols size={1} align='center' space='between'>
        <Flex.Rows size={1} align='center' space='between'>
          <Text big>Bump!</Text>
        </Flex.Rows>
      </Flex.Cols>
    )
  }
}
