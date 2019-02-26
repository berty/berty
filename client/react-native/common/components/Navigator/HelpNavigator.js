import { createStackNavigator } from 'react-navigation'
import List from '../Screens/Settings/Help/List'
import FAQ from '../Screens/Settings/Help/FAQ'
import Contact from '../Screens/Settings/Help/Contact'

export default createStackNavigator(
  {
    'help/list': List,
    'help/faq': FAQ,
    'help/contact': Contact,
  },
  {
    initialRouteName: 'help/list',
  }
)
