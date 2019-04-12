import { createStackNavigator } from 'react-navigation'
import List from '../screen/Settings/Help/List'
import FAQ from '../screen/Settings/Help/FAQ'
import Contact from '../screen/Settings/Help/Contact'

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
