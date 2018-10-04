import { createSubStackNavigator } from '../../../../helpers/react-navigation'
import List from './List'
import Database from './Database'
import Network from './Network'
import EventList from './EventList'
import EventDetails from './EventDetails'

export default createSubStackNavigator(
  {
    'devtools/list': List,
    'devtools/database': Database,
    'devtools/network': Network,
    'devtools/eventlist': EventList,
    'devtools/eventdetails': EventDetails,
  },
  {
    initialRouteName: 'devtools/list',
  }
)
