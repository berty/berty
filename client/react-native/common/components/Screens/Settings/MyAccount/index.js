import { createSubStackNavigator } from '../../../../helpers/react-navigation'
import MyAccount from './MyAccount'
import MyPublicKey from './MyPublicKey'
import MyQRCode from './MyQRCode'

export default createSubStackNavigator(
  {
    'my-account/list': MyAccount,
    'my-account/my-qrcode': MyPublicKey,
    'my-account/my-publickey': MyQRCode,
  },
  {
    initialRouteName: 'my-account/list',
  }
)
