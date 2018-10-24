import React, { PureComponent } from 'react'
import { Header, Text, Flex } from '../../../Library'

export default class Contact extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: <Header navigation={navigation} title='Contact us' backBtn />,
  })
  render () {
    return (
      <Flex.Cols size={1} align='center' justify='between'>
        <Flex.Rows size={1} align='center' justify='between'>
          <Text big>Contact us</Text>
        </Flex.Rows>
      </Flex.Cols>
    )
  }
}
