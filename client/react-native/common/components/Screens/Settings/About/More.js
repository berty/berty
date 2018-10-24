import React, { PureComponent } from 'react'
import { Header, Text, Flex } from '../../../Library'

export default class More extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: <Header navigation={navigation} title='More about Berty' backBtn />,
  })
  render () {
    return (
      <Flex.Cols size={1} align='center' justify='between'>
        <Flex.Rows size={1} align='center' justify='between'>
          <Text big>Display Berty whitepaper?</Text>
        </Flex.Rows>
      </Flex.Cols>
    )
  }
}
