import { createSubStackNavigator } from '../../../helpers/react-navigation'
import Add from './Add'
import Detail from './Detail'
import Edit from './Edit'
import List from './List'

export default createSubStackNavigator(
  {
    List,
    Add,
    Detail,
    Edit,
  },
  {
    initialRouteName: 'List',
    hedaer: null,
  }
)
