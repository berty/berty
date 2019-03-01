import React from 'react'
import { createMaterialTopTabNavigator, withNavigation } from 'react-navigation'
import ByQRCode from './ByQRCode'
import ByPublicKey from './ByPublicKey'
import Invite from './Invite'
import { tabIcon, withScreenProps } from '../../../../helpers/views'
import { tabNavigatorOptions } from '../../../../constants/styling'
import { View, Keyboard } from 'react-native'
import I18n from 'i18next'

const AddContactTabbedContent = createMaterialTopTabNavigator(
  {
    'qrcode': {
      screen: withScreenProps(ByQRCode),
      navigationOptions: () => ({
        title: I18n.t('qrcode'),
        tabBarIcon: tabIcon('material-qrcode'),
      }),
    },
    'public-key': {
      screen: withScreenProps(ByPublicKey),
      navigationOptions: () => ({
        title: I18n.t('public-key'),
        tabBarIcon: tabIcon('material-key-variant'),
      }),
    },
    'nearby': {
      screen: withScreenProps(Invite),
      navigationOptions: () => ({
        title: I18n.t('contacts.add.nearby'),
        tabBarIcon: tabIcon('radio'),
      }),
    },
    'invite': {
      screen: withScreenProps(Invite),
      navigationOptions: () => ({
        title: I18n.t('contacts.add.invite'),
        tabBarIcon: tabIcon('material-email'),
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
  },
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
