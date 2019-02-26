import { createStackNavigator } from 'react-navigation'
import Network from '../Screens/Settings/Devtools/Network/Network'
import Peers from '../Screens/Settings/Devtools/Network/Peers'
import Config from '../Screens/Settings/Devtools/Network/Config'

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
