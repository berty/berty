import { createStackNavigator } from 'react-navigation'
import List from '@berty/screen/Settings/Devtools/List'
import Database from '@berty/screen/Settings/Devtools/Database'
import EventList, {
  EventListFilterModal,
} from '@berty/screen/Settings/Devtools/EventList'
import EventDetails from '@berty/screen/Settings/Devtools/EventDetails'
import DeviceInfos from '@berty/screen/Settings/Devtools/DeviceInfos'
import Tests from '@berty/screen/Settings/Devtools/Tests'
import TestResult from '@berty/screen/Settings/Devtools/TestResult'
import Language from '@berty/screen/Settings/Devtools/Language'
import Notifications from '@berty/screen/Settings/Devtools/Notifications'
import DevtoolsNetworkNavigator from './DevtoolsNetworkNavigator'
import DevtoolsLogNavigator from './DevtoolsLogNavigator'

export default createStackNavigator(
  {
    'devtools/list': List,
    'devtools/database': Database,
    'devtools/network': {
      screen: DevtoolsNetworkNavigator,
      navigationOptions: () => ({
        header: null,
      }),
    },
    'devtools/eventlist': EventList,
    'devtools/eventlistfilter': EventListFilterModal,
    'devtools/eventdetails': EventDetails,
    'devtools/deviceinfos': DeviceInfos,
    'devtools/logs': {
      screen: DevtoolsLogNavigator,
      navigationOptions: () => ({
        header: null,
      }),
    },
    'devtools/tests': Tests,
    'devtools/testresult': TestResult,
    'devtools/language': Language,
    'devtools/notifications': Notifications,
  },
  {
    initialRouteName: 'devtools/list',
  }
)
