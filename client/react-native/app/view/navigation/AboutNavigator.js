import { createStackNavigator } from 'react-navigation'
import List from '../screen/Settings/About/List'
import Changelog from '../screen/Settings/About/Changelog'
import More from '../screen/Settings/About/More'

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
