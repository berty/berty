import { createStackNavigator } from 'react-navigation'
import List from './List'
import MyAccount from './MyAccount'
import MyPublicKey from './MyPublicKey'
import MyQRCode from './MyQRCode'

export default createStackNavigator({
  List,
  MyAccount,
  MyPublicKey,
  MyQRCode,
})
