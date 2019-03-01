import { createStackNavigator } from 'react-navigation'
import List from '../Screens/Chats/Settings/List'
import Notifications from '../Screens/Chats/Settings/Notifications'

export default createStackNavigator(
  {
    'chats/settings/list': List,
    'chats/settings/notifications': Notifications,
  },
  {
    initialRouteName: 'chats/settings/list',
  }
)
