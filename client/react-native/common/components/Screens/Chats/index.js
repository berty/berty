import { createStackNavigator } from 'react-navigation'
import List from './List'
import Detail from './Detail'

export default createStackNavigator(
  {
    List,
    Detail,
  },
  {
    initialRouteName: 'List',
  }
)
