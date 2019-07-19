import { createStackNavigator } from 'react-navigation'
import List from '@berty/screen/Settings/About/List'
import Changelog from '@berty/screen/Settings/About/Changelog'
import More from '@berty/screen/Settings/About/More'

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
