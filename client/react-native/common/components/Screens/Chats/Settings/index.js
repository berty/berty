import { createSubStackNavigator } from '../../../../helpers/react-navigation'
import List from './List'
import Notifications from './Notifications'

export default createSubStackNavigator(
  {
    'chats/settings/list': List,
    'chats/settings/notifications': Notifications,
  },
  {
    initialRouteName: 'chats/settings/list',
  }
)
