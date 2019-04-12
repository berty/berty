import React, { PureComponent } from 'react'
import { View, Image } from 'react-native'
import { Header, Menu } from '@berty/view/component'
import { withNamespaces } from 'react-i18next'
import I18n from 'i18next'

class List extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header navigation={navigation} title={I18n.t('settings.help')} backBtn />
    ),
    tabBarVisible: false,
  })

  render () {
    const { navigation, t } = this.props
    return (
      <View style={{ flex: 1 }}>
        <Image
          resizeMode='contain'
          style={{ flex: 3, width: null, height: null, marginTop: 42 }}
          source={require('@berty/common/static/img/square_help.png')}
        />
        <Menu>
          <Menu.Section>
            <Menu.Item
              icon='book-open'
              title={t('settings.faq')}
              onPress={() => navigation.navigate('help/faq')}
            />
          </Menu.Section>
          <Menu.Section>
            <Menu.Item
              icon='message-circle'
              title={t('settings.contact-us')}
              onPress={() => navigation.navigate('help/contact')}
            />
          </Menu.Section>
        </Menu>
      </View>
    )
  }
}

export default withNamespaces()(List)
