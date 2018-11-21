import { createStackNavigator } from 'react-navigation'
import Auth from './Auth'

export default createStackNavigator(
  {
    // 'accounts/list': List,
    'accounts/auth': Auth,
  },
  {
    initialRouteName: 'accounts/auth',
    headerMode: 'none',
  }
)
