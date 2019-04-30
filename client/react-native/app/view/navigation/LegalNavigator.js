import { createStackNavigator } from 'react-navigation'
import List from '../screen/Settings/Legal/List'
import Privacy from '../screen/Settings/Legal/Privacy'
import Terms from '../screen/Settings/Legal/Terms'
import Credits from '../screen/Settings/Legal/Credits'
import License from '../screen/Settings/Legal/License'

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
