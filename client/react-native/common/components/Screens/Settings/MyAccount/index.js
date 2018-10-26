import { createSubStackNavigator } from '../../../../helpers/react-navigation'
import MyAccount from './MyAccount'
import MyQRCode from './MyQRCode'
import MyPublicKey from './MyPublicKey'

export default createSubStackNavigator(
  {
    'my-account/list': MyAccount,
    'my-account/my-qrcode': MyQRCode,
    'my-account/my-publickey': MyPublicKey,
  },
  {
    initialRouteName: 'my-account/list',
  }
)
