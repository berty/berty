import { createStackNavigator } from 'react-navigation'
import { LogStream, FilterModal } from '../screen/Settings/Devtools/Logs'

export default createStackNavigator(
  {
    'devtools/logs/list': LogStream,
    'devtools/logs/filter': FilterModal,
  },
  {
    mode: 'modal',
    initialRouteName: 'devtools/logs/list',
  }
)
