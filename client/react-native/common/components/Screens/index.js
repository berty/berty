import createTabNavigator from 'react-navigation-deprecated-tab-navigator/src/createTabNavigator'
import Contacts from './Contacts'
import Chats from './Chats'
import Settings from './Settings'
import { colors } from '../../constants'
import { borderTop, shadow } from '../../styles'

export default createTabNavigator(
  {
    Contacts,
    Chats,
    Settings,
  },
  {
    initialRouteName: 'Chats',
    swipeEnabled: true,
    animationEnabled: true,
    tabBarPosition: 'bottom',
    tabBarOptions: {
      labelStyle: {
        color: colors.black,
      },
      indicatorStyle: {
        backgroundColor: colors.black,
      },
      style: [
        {
          backgroundColor: colors.white,
        },
        borderTop,
        shadow,
      ],
    },
  }
)
