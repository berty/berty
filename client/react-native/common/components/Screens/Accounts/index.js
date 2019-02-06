import { createSwitchNavigator, createAppContainer } from 'react-navigation'
import Auth from './Auth'
import Current from './Current'

export default createAppContainer(
  createSwitchNavigator(
    {
      'accounts/auth': Auth,
      'accounts/current': Current,
    },
    {
      initialRouteName: 'accounts/auth',
      headerMode: 'none',
    }
  )
)
