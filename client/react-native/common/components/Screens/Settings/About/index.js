import { createSubStackNavigator } from '../../../../helpers/react-navigation'
import List from './List'
import Changelog from './Changelog'
import More from './More'

export default createSubStackNavigator(
  {
    'about/list': List,
    'about/changelog': Changelog,
    'about/more': More,
  },
  {
    initialRouteName: 'about/list',
  }
)
