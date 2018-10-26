import { createSubStackNavigator } from '../../../helpers/react-navigation'
import List from './List'
import Add from './Add'
import Detail from './Detail'
import Edit from './Edit'
import DetailPubKey from './DetailPubKey'

export default createSubStackNavigator(
  {
    'contacts/list': List,
    'contacts/add': Add,
    'contacts/detail': Detail,
    'contacts/detail/edit': Edit,
    'contacts/detail/publickey': DetailPubKey,
  },
  {
    initialRouteName: 'contacts/list',
    header: null,
  }
)
