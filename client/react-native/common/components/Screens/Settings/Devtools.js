import React, { PureComponent } from 'react'
import { Image } from 'react-native'
import { Flex, Header } from '../../Library'

export default class Devtools extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header
        navigation={navigation}
        title='Developer Tools'
        titleIcon='terminal'
        backBtn
      />
    ),
  })
  render () {
    return (
      <Flex.Cols size={1} align='center' justify='between'>
        <Flex.Rows size={1} align='center' justify='between'>
          <Image
            style={{ width: 300, height: 550 }}
            source='https://imgs.xkcd.com/comics/tasks_2x.png'
          />
        </Flex.Rows>
      </Flex.Cols>
    )
  }
}
