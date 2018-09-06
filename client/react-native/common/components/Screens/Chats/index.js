import { createSubStackNavigator } from '../../../helpers/react-navigation'
import List from './List'
import Detail from './Detail'

export default createSubStackNavigator(
  {
    List,
    Detail,
  },
  {
    initialRouteName: 'List',
  }
)
