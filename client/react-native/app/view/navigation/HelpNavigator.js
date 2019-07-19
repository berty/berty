import { createStackNavigator } from 'react-navigation'
import List from '@berty/screen/Settings/Help/List'
import FAQ from '@berty/screen/Settings/Help/FAQ'
import Contact from '@berty/screen/Settings/Help/Contact'

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
