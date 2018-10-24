import { createSubStackNavigator } from '../../../../helpers/react-navigation'
import List from './List'
import Privacy from './Privacy'
import Terms from './Terms'
import Credits from './Credits'
import License from './License'

export default createSubStackNavigator(
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
