import React from 'react'
import { createMaterialTopTabNavigator, withNavigation } from 'react-navigation'
import ByQRCode from './ByQRCode'
import ByPublicKey from './ByPublicKey'
import Invite from './Invite'
import { withProps, withScreenProps } from '@berty/common/helpers/views'
import { tabNavigatorOptions } from '@berty/common/constants/styling'
import TabIcon from '@berty/component/TabIcon'
import { View, Keyboard } from 'react-native'
import I18n from 'i18next'

const AddContactTabbedContent = createMaterialTopTabNavigator(
  {
    qrcode: {
      screen: withScreenProps(ByQRCode),
      navigationOptions: () => ({
        title: I18n.t('qrcode'),
        tabBarIcon: withProps({ name: 'material-qrcode' })(TabIcon),
      }),
    },
    'public-key': {
      screen: withScreenProps(ByPublicKey),
      navigationOptions: () => ({
        title: I18n.t('public-key'),
        tabBarIcon: withProps({ name: 'material-key-variant' })(TabIcon),
      }),
    },
    nearby: {
      screen: withScreenProps(Invite),
      navigationOptions: () => ({
        title: I18n.t('contacts.add.nearby'),
        tabBarIcon: withProps({ name: 'radio' })(TabIcon),
      }),
    },
    invite: {
      screen: withScreenProps(Invite),
      navigationOptions: () => ({
        title: I18n.t('contacts.add.invite'),
        tabBarIcon: withProps({ name: 'material-email' })(TabIcon),
      }),
    },
  },
  {
    ...tabNavigatorOptions,
    animationEnabled: false,
    defaultNavigationOptions: {
      tabBarOnPress: ({ navigation, defaultHandler }) => {
        defaultHandler()
        Keyboard.dismiss()
      },
    },
  }
)

class AddScreen extends React.Component {
  static router = AddContactTabbedContent.router

  render () {
    const { navigation } = this.props
    return (
      <View style={{ flex: 1 }}>
        <AddContactTabbedContent navigation={navigation} />
      </View>
    )
  }
}

export default withNavigation(AddScreen)
