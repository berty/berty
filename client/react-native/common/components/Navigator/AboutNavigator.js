import { createStackNavigator } from 'react-navigation'
import List from '../Screens/Settings/About/List'
import Changelog from '../Screens/Settings/About/Changelog'
import More from '../Screens/Settings/About/More'

export default createStackNavigator(
  {
    'about/list': List,
    'about/changelog': Changelog,
    'about/more': More,
  },
  {
    initialRouteName: 'about/list',
  }
)
