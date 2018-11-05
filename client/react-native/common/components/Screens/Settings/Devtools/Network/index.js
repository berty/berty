import { createSubStackNavigator } from '../../../../../helpers/react-navigation'
import Network from './Network'
import Peers from './Peers'
import Config from './Config'

export default createSubStackNavigator(
  {
    'network/list': Network,
    'network/config': Config,
    'network/peers': Peers,
  },
  {
    initialRouteName: 'network/list',
  }
)
