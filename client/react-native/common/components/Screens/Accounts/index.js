import { createSwitchNavigator } from 'react-navigation'
import Auth from './Auth'
import Current from './Current'

export default createSwitchNavigator(
  {
    'accounts/auth': Auth,
    'accounts/current': Current,
  },
  {
    initialRouteName: 'accounts/auth',
    headerMode: 'none',
  }
)
