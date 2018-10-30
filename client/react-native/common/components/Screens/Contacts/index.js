import { createSubStackNavigator } from '../../../helpers/react-navigation'
import List from './List'
import Add from './Add'
import Detail from './Detail'

export default createSubStackNavigator(
  {
    'contacts/list': List,
    'contacts/add': Add,
    'contacts/detail': Detail,
  },
  {
    initialRouteName: 'contacts/list',
    header: null,
  }
)
