import { createStackNavigator } from 'react-navigation'
import List from '../Screens/Chats/List'
import Detail from '../Screens/Chats/Detail'
import Add from '../Screens/Chats/Add'
import ChatSettingsNavigator from './ChatSettingsNavigator'

export default createStackNavigator(
  {
    'chats/list': List,
    'chats/add': Add,
    'chats/detail': Detail,
    'chats/settings': ChatSettingsNavigator,
  },
  {
    initialRouteName: 'chats/list',
  }
)
