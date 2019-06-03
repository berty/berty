import { tabNavigatorOptions } from '@berty/common/constants/styling'
import { withProps, asFunctional } from '@berty/common/helpers/views'
import ByPublicKey from '@berty/screen/Contacts/Add/ByPublicKey'
import ByQRCode from '@berty/screen/Contacts/Add/ByQRCode'
import Invite from '@berty/screen/Contacts/Add/Invite'

import TabIcon from '@berty/component/TabIcon'
import { Keyboard } from 'react-native'
import { createMaterialTopTabNavigator } from 'react-navigation'
import I18n from 'i18next'

export default createMaterialTopTabNavigator(
  {
    qrcode: {
      screen: ByQRCode,
      navigationOptions: () => ({
        title: I18n.t('qrcode'),
        tabBarIcon: asFunctional(
          withProps({ name: 'material-qrcode' })(TabIcon)
        ),
      }),
    },
    'public-key': {
      screen: ByPublicKey,
      navigationOptions: () => ({
        title: I18n.t('public-key'),
        tabBarIcon: asFunctional(
          withProps({ name: 'material-key-variant' })(TabIcon)
        ),
      }),
    },
    nearby: {
      screen: Invite,
      navigationOptions: () => ({
        title: I18n.t('contacts.add.nearby'),
        tabBarIcon: asFunctional(withProps({ name: 'radio' })(TabIcon)),
      }),
    },
    invite: {
      screen: Invite,
      navigationOptions: () => ({
        title: I18n.t('contacts.add.invite'),
        tabBarIcon: asFunctional(
          withProps({ name: 'material-email' })(TabIcon)
        ),
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
