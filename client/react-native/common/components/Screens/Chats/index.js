import { createSubStackNavigator } from '../../../helpers/react-navigation'
import List from './List'
import Detail from './Detail'
import Add from './Add'

export default createSubStackNavigator(
  {
    List,
    Detail,
    Add,
  },
  {
    initialRouteName: 'List',
  }
)
