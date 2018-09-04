import { createBottomTabNavigator } from 'react-navigation'
import FromContact from './FromContact'
import FromMine from './FromMine'

export default createBottomTabNavigator(
  {
    'Enter public key': FromContact,
    'My public key': FromMine,
  },
  {
    initialRoute: 'Enter public key',
  }
)
