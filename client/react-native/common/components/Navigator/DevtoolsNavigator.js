import { createStackNavigator } from 'react-navigation'
import List from '../Screens/Settings/Devtools/List'
import Database from '../Screens/Settings/Devtools/Database'
import EventList, { EventListFilterModal } from '../Screens/Settings/Devtools/EventList'
import EventDetails from '../Screens/Settings/Devtools/EventDetails'
import DeviceInfos from '../Screens/Settings/Devtools/DeviceInfos'
import Tests from '../Screens/Settings/Devtools/Tests'
import TestResult from '../Screens/Settings/Devtools/TestResult'
import Language from '../Screens/Settings/Devtools/Language'
import Notifications from '../Screens/Settings/Devtools/Notifications'
import DevtoolsNetworkNavigator from './DevtoolsNetworkNavigator'
import DevtoolsLogNavigator from './DevtoolsLogNavigator'

export default createStackNavigator(
  {
    'devtools/list': List,
    'devtools/database': Database,
    'devtools/network': DevtoolsNetworkNavigator,
    'devtools/eventlist': EventList,
    'devtools/eventlistfilter': EventListFilterModal,
    'devtools/eventdetails': EventDetails,
    'devtools/deviceinfos': DeviceInfos,
    'devtools/logs': DevtoolsLogNavigator,
    'devtools/tests': Tests,
    'devtools/testresult': TestResult,
    'devtools/language': Language,
    'devtools/notifications': Notifications,
  },
  {
    initialRouteName: 'devtools/list',
  }
)
