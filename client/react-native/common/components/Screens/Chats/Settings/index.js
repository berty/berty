import { createSubStackNavigator } from '../../../../helpers/react-navigation'
import List from './List'
import Notifications from './Notifications'

export default createSubStackNavigator(
  {
    'settings/list': List,
    'settings/notifications': Notifications,
  },
  {
    initialRouteName: 'settings/list',
  }
)
