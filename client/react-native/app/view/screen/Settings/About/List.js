import React, { PureComponent } from 'react'
import { View, Image } from 'react-native'
import { Header, Menu } from '@berty/view/component'
import { withNamespaces } from 'react-i18next'
import withRelayContext from '@berty/common/helpers/withRelayContext'
import I18n from 'i18next'

class List extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header
        navigation={navigation}
        title={I18n.t('settings.about')}
        backBtn
      />
    ),
    tabBarVisible: false,
  })

  state = {
    version: null,
  }

  componentDidMount () {
    this.props.context.queries.AppVersion.fetch().then(data => {
      this.setState({ version: data.version })
    })
  }

  render () {
    const { navigation, t } = this.props
    const { version } = this.state
    return (
      <View style={{ flex: 1 }}>
        <Image
          resizeMode='contain'
          style={{ flex: 3, width: null, height: null, marginTop: 42 }}
          source={require('@berty/common/static/img/square_about.png')}
        />
        <Menu>
          <Menu.Section>
            <Menu.Item
              icon='smartphone'
              title={t('settings.version')}
              textRight={version}
            />
            <Menu.Item
              icon='check-circle'
              title={t('settings.changelog')}
              onPress={() => navigation.navigate('about/changelog')}
            />
          </Menu.Section>
          <Menu.Section>
            <Menu.Item
              icon='info'
              title={t('settings.learn-more')}
              onPress={() => navigation.navigate('about/more')}
            />
          </Menu.Section>
        </Menu>
      </View>
    )
  }
}

export default withRelayContext(withNamespaces()(List))
