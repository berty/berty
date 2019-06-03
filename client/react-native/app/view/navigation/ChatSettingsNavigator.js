import { createStackNavigator } from 'react-navigation'
import List from '@berty/screen/Chats/Settings/List'
import Notifications from '@berty/screen/Chats/Settings/Notifications'

export default createStackNavigator(
  {
    'chats/settings/list': List,
    'chats/settings/notifications': Notifications,
  },
  {
    initialRouteName: 'chats/settings/list',
  }
)
