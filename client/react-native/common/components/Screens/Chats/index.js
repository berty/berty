import { createSubStackNavigator } from '../../../helpers/react-navigation'
import List from './List'
import Detail from './Detail'
import Add from './Add'
import Settings from './Settings/index.js'

export default createSubStackNavigator(
  {
    'chats/list': List,
    'chats/add': Add,
    'chats/detail': Detail,
    'chats/settings': Settings,
  },
  {
    initialRouteName: 'chats/list',
  }
)
