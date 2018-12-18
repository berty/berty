import { createSubStackNavigator } from '../../../../helpers/react-navigation'
import List from './Detail'
import Edit from './Edit'

export default createSubStackNavigator(
  {
    'detail/list': List,
    'detail/edit': Edit,
  },
  {
    initialRouteName: 'detail/list',
  }
)
