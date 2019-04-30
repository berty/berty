import { createStackNavigator } from 'react-navigation'
import List from '../screen/Chats/Settings/List'
import Notifications from '../screen/Chats/Settings/Notifications'

export default createStackNavigator(
  {
    'chats/settings/list': List,
    'chats/settings/notifications': Notifications,
  },
  {
    initialRouteName: 'chats/settings/list',
  }
)
