import { createSubStackNavigator } from '../../../helpers/react-navigation'
import Add from './Add'
import Detail from './Detail'
import Edit from './Edit'
import List from './List'

export default createSubStackNavigator(
  {
    'contacts/list': List,
    'contacts/add': Add,
    'contacts/detail': Detail,
    'contacts/edit': Edit,
  },
  {
    initialRouteName: 'contacts/list',
    header: null,
  }
)
