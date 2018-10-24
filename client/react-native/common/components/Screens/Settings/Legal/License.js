import React, { PureComponent } from 'react'
import { Header, Text, Flex } from '../../../Library'

export default class License extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: <Header navigation={navigation} title='Software license' backBtn />,
  })
  render () {
    return (
      <Flex.Cols size={1} align='center' justify='between'>
        <Flex.Rows size={1} align='center' justify='between'>
          <Text big>Software license</Text>
        </Flex.Rows>
      </Flex.Cols>
    )
  }
}
