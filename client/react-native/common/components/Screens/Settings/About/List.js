import React, { PureComponent } from 'react'
import { Image } from 'react-native'
import { Header, Menu, Flex } from '../../../Library'
import { AppVersion } from '../../../../graphql/queries'

export default class List extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: <Header navigation={navigation} title='About Berty' backBtn />,
    tabBarVisible: false,
  })

  state = {
    version: null,
  }

  componentDidMount () {
    AppVersion.then(data => {
      this.setState({ version: data.AppVersion.version })
    })
  }

  render () {
    const { navigation } = this.props
    const { version } = this.state
    return (
      <Menu style={{ marginTop: 42 }}>
        <Flex.Cols size={1} align='center' justify='between'>
          <Flex.Rows size={1} align='center' justify='between'>
            <Image
              resizeMode='contain'
              style={{ width: 300, height: 300 }}
              source={require('../../../../static/img/square_about.svg')}
            />
          </Flex.Rows>
        </Flex.Cols>
        <Menu.Section>
          <Menu.Item
            icon='smartphone'
            title='App version'
            description={version}
          />
          <Menu.Item
            icon='check-circle'
            title='Changelog'
            onPress={() => navigation.push('about/changelog')}
          />
        </Menu.Section>
        <Menu.Section>
          <Menu.Item
            icon='info'
            title='Learn more about Berty'
            onPress={() => navigation.push('about/more')}
          />
        </Menu.Section>
      </Menu>
    )
  }
}
