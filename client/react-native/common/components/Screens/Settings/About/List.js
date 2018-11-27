import { View, Image } from 'react-native'
import React, { PureComponent } from 'react'

import { Header, Menu } from '../../../Library'
import { RelayContext } from '../../../../relay'

export default class List extends PureComponent {
  static contextType = RelayContext

  static navigationOptions = ({ navigation }) => ({
    header: <Header navigation={navigation} title='About Berty' backBtn />,
    tabBarVisible: false,
  })

  state = {
    version: null,
  }

  componentDidMount () {
    this.context.queries.AppVersion.fetch().then(data => {
      this.setState({ version: data.AppVersion.version })
    })
  }

  render () {
    const { navigation } = this.props
    const { version } = this.state
    return (
      <View style={{ flex: 1 }}>
        <Image
          resizeMode='contain'
          style={{ flex: 3, width: null, height: null, marginTop: 42 }}
          source={require('../../../../static/img/square_about.png')}
        />
        <Menu>
          <Menu.Section>
            <Menu.Item
              icon='smartphone'
              title='App version'
              textRight={version}
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
      </View>
    )
  }
}
