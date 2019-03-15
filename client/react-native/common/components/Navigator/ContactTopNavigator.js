import { colors } from '../../constants'
import { borderBottom } from '../../styles'
import { createMaterialTopTabNavigator } from 'react-navigation'
import Mutuals from '../Screens/Contacts/List/Mutuals'
import Received from '../Screens/Contacts/List/Received'
import Sent from '../Screens/Contacts/List/Sent'
import I18n from 'i18next'

export default createMaterialTopTabNavigator(
  {
    'mutuals': {
      screen: Mutuals,
      navigationOptions: () => ({
        title: I18n.t('contacts.all'),
      }),
    },
    'received': {
      screen: Received,
      navigationOptions: () => ({
        title: I18n.t('contacts.received'),
      }),
    },
    'sent': {
      screen: Sent,
      navigationOptions: () => ({
        title: I18n.t('contacts.sent'),
      }),
    },
  },
  {
    optimizationsEnabled: true,
    initialRouteName: 'mutuals',
    swipeEnabled: true,
    animationEnabled: true,
    tabBarOptions: {
      labelStyle: {
        color: colors.fakeBlack,
      },
      indicatorStyle: {
        backgroundColor: colors.blue,
      },
      style: [
        {
          backgroundColor: colors.white,
          borderTopWidth: 0,
        },
        borderBottom,
      ],
    },
  },
)
