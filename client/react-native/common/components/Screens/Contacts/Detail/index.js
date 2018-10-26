import { createSubStackNavigator } from '../../../../helpers/react-navigation'
import List from './Detail'
import Edit from './Edit'
import PublicKey from './PublicKey'

export default createSubStackNavigator(
  {
    'detail/list': List,
    'detail/edit': Edit,
    'detail/publickey': PublicKey,
  },
  {
    initialRouteName: 'detail/list',
  }
)
