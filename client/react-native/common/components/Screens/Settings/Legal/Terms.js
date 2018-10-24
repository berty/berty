import React, { PureComponent } from 'react'
import { Header, Text, Flex } from '../../../Library'

export default class Terms extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: <Header navigation={navigation} title='Terms of service' backBtn />,
  })
  render () {
    return (
      <Flex.Cols size={1} align='center' justify='between'>
        <Flex.Rows size={1} align='center' justify='between'>
          <Text big>Terms of service</Text>
        </Flex.Rows>
      </Flex.Cols>
    )
  }
}
