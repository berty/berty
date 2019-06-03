import React, { PureComponent } from 'react'
import { View, Image } from 'react-native'
import { Header, Menu } from '@berty/component'
import { withNamespaces } from 'react-i18next'
import I18n from 'i18next'

class List extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header
        navigation={navigation}
        title={I18n.t('settings.legal')}
        backBtn
      />
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
          source={require('@berty/common/static/img/square_legal.png')}
        />
        <Menu>
          <Menu.Section>
            <Menu.Item
              icon='book-open'
              title={t('settings.privacy-policy')}
              onPress={() => navigation.navigate('legal/privacy')}
            />
            <Menu.Item
              icon='book-open'
              title={t('settings.terms-of-service')}
              onPress={() => navigation.navigate('legal/terms')}
            />
          </Menu.Section>
          <Menu.Section>
            <Menu.Item
              icon='layers'
              title={t('settings.app-credits')}
              onPress={() => navigation.navigate('legal/credits')}
            />
            <Menu.Item
              icon='layers'
              title={t('settings.software-license')}
              onPress={() => navigation.navigate('legal/license')}
            />
          </Menu.Section>
        </Menu>
      </View>
    )
  }
}

export default withNamespaces()(List)
