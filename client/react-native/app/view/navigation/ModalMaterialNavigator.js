import { createMaterialTopTabNavigator } from 'react-navigation'
import { Keyboard } from 'react-native'
import ByQRCode from '../screen/Contacts/Add/ByQRCode'
import ByPublicKey from '../screen/Contacts/Add/ByPublicKey'
import Invite from '../screen/Contacts/Add/Invite'
import { tabIcon } from '@berty/common/helpers/views'
import { tabNavigatorOptions } from '@berty/common/constants/styling'
import I18n from 'i18next'

export default createMaterialTopTabNavigator(
  {
    qrcode: {
      screen: ByQRCode,
      navigationOptions: () => ({
        title: I18n.t('qrcode'),
        tabBarIcon: tabIcon('material-qrcode'),
      }),
    },
    'public-key': {
      screen: ByPublicKey,
      navigationOptions: () => ({
        title: I18n.t('public-key'),
        tabBarIcon: tabIcon('material-key-variant'),
      }),
    },
    nearby: {
      screen: Invite,
      navigationOptions: () => ({
        title: I18n.t('contacts.add.nearby'),
        tabBarIcon: tabIcon('radio'),
      }),
    },
    invite: {
      screen: Invite,
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
  }
)
