import { createSubStackNavigator } from '../../../../helpers/react-navigation'
import List from './List'
import FAQ from './FAQ'
import Contact from './Contact'

export default createSubStackNavigator(
  {
    'help/list': List,
    'help/faq': FAQ,
    'help/contact': Contact,
  },
  {
    initialRouteName: 'help/list',
  }
)
