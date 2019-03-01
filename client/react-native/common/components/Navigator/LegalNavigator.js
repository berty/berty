import { createStackNavigator } from 'react-navigation'
import List from '../Screens/Settings/Legal/List'
import Privacy from '../Screens/Settings/Legal/Privacy'
import Terms from '../Screens/Settings/Legal/Terms'
import Credits from '../Screens/Settings/Legal/Credits'
import License from '../Screens/Settings/Legal/License'

export default createStackNavigator(
  {
    'legal/list': List,
    'legal/privacy': Privacy,
    'legal/terms': Terms,
    'legal/credits': Credits,
    'legal/license': License,
  },
  {
    initialRouteName: 'legal/list',
  }
)
