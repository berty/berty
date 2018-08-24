import { createStackNavigator } from 'react-navigation'
import Add from './Add'
import Detail from './Detail'
import Edit from './Edit'
import List from './List'

export default createStackNavigator(
  {
    List,
    Add,
    Detail,
    Edit,
  },
  {
    initialHomeName: 'List',
  }
)
