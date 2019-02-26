import { createMaterialTopTabNavigator } from 'react-navigation'
import ByQRCode from '../Screens/Contacts/Add/ByQRCode'
import ByPublicKey from '../Screens/Contacts/Add/ByPublicKey'
import Invite from '../Screens/Contacts/Add/Invite'
import { tabIcon } from '../../helpers/views'
import { tabNavigatorOptions } from '../../constants/styling'
import I18n from 'i18next'

export default createMaterialTopTabNavigator(
  {
    'qrcode': {
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
    'nearby': {
      screen: Invite,
      navigationOptions: () => ({
        title: I18n.t('contacts.add.nearby'),
        tabBarIcon: tabIcon('radio'),
      }),
    },
    'invite': {
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
  },
)

// const AddScreen = () => <View style={{ flex: 1 }}>
//   <AddContactTabbedContent />
// </View>
