import { createSubStackNavigator } from '../../../../helpers/react-navigation'
import List from './List'
import Database from './Database'
import Network from './Network'
import EventList from './EventList'
import EventDetails from './EventDetails'
import DeviceInfos from './DeviceInfos'
import Tests from './Tests'
import TestResult from './TestResult'

export default createSubStackNavigator(
  {
    'devtools/list': List,
    'devtools/database': Database,
    'devtools/network': Network,
    'devtools/eventlist': EventList,
    'devtools/eventdetails': EventDetails,
    'devtools/deviceinfos': DeviceInfos,
    'devtools/tests': Tests,
    'devtools/testresult': TestResult,
  },
  {
    initialRouteName: 'devtools/list',
  }
)
