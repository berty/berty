import React, { PureComponent } from 'react'
import { Text, Flex } from '@berty/component'

export default class Invite extends PureComponent {
  render () {
    return (
      <Flex.Cols size={1} align='center' justify='between'>
        <Flex.Rows size={1} align='center' justify='between'>
          <Text big>Invite!</Text>
        </Flex.Rows>
      </Flex.Cols>
    )
  }
}
