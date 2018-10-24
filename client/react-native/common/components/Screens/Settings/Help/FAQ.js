import React, { PureComponent } from 'react'
import { Header, Text, Flex } from '../../../Library'

export default class FAQ extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: <Header navigation={navigation} title='FAQ' backBtn />,
  })
  render () {
    return (
      <Flex.Cols size={1} align='center' justify='between'>
        <Flex.Rows size={1} align='center' justify='between'>
          <Text big>FAQ</Text>
        </Flex.Rows>
      </Flex.Cols>
    )
  }
}
