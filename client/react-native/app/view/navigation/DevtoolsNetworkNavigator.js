import { createStackNavigator } from 'react-navigation'
import Network from '@berty/screen/Settings/Devtools/Network/Network'
import Peers from '@berty/screen/Settings/Devtools/Network/Peers'
import Config from '@berty/screen/Settings/Devtools/Network/Config'

export default createStackNavigator(
  {
    'network/list': Network,
    'network/config': Config,
    'network/peers': Peers,
  },
  {
    initialRouteName: 'network/list',
  }
)
