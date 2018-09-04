import { createBottomTabNavigator } from 'react-navigation'
import Contacts from './Contacts'
import Chats from './Chats'
import Settings from './Settings'

export default createBottomTabNavigator(
  {
    Contacts,
    Chats,
    Settings,
  },
  {
    initialRouteName: 'Chats',
  }
)
