import { createStackNavigator } from 'react-navigation'
import Choice from './Choice'
import ByBump from './ByBump'
import ByPublicKey from './ByPublicKey'
import ByQRCode from './ByQRCode'

export default createStackNavigator(
  {
    ByBump,
    ByPublicKey,
    ByQRCode,
    Choice,
  },
  {
    initialHomeName: 'Choice',
  }
)
