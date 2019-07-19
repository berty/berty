import { createStackNavigator } from 'react-navigation'
import List from '@berty/screen/Settings/Legal/List'
import Privacy from '@berty/screen/Settings/Legal/Privacy'
import Terms from '@berty/screen/Settings/Legal/Terms'
import Credits from '@berty/screen/Settings/Legal/Credits'
import License from '@berty/screen/Settings/Legal/License'

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
