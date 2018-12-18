import { createSubStackNavigator } from '../../../../helpers/react-navigation'
import MyAccount from './MyAccount'

export default createSubStackNavigator(
  {
    'my-account/list': MyAccount,
  },
  {
    initialRouteName: 'my-account/list',
  }
)
