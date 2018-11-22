import { createSubStackNavigator } from '../../../../helpers/react-navigation'
import List from './List'
import Database from './Database'
import Network from './Network'
import EventList, { EventListFilterModal } from './EventList'
import EventDetails from './EventDetails'
import DeviceInfos from './DeviceInfos'
import Logs from './Logs'
import Tests from './Tests'
import TestResult from './TestResult'

export default createSubStackNavigator(
  {
    'devtools/list': List,
    'devtools/database': Database,
    'devtools/network': Network,
    'devtools/eventlist': EventList,
    'devtools/eventlistfilter': EventListFilterModal,
    'devtools/eventdetails': EventDetails,
    'devtools/deviceinfos': DeviceInfos,
    'devtools/logs': Logs,
    'devtools/tests': Tests,
    'devtools/testresult': TestResult,
  },
  {
    initialRouteName: 'devtools/list',
  }
)
