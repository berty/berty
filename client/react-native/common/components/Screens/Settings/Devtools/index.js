import React from 'react'
import { createSubStackNavigator } from '../../../../helpers/react-navigation'
import { Header } from '../../../Library'
import List from './List'
import Database from './Database'
import Network from './Network'
import EventList from './EventList'

export default createSubStackNavigator(
  {
    'devtools/list': List,
    'devtools/database': Database,
    'devtools/network': Network,
    'devtools/events': EventList,
  },
  {
    initialRouteName: 'devtools/list',
    navigationOptions: ({ navigation }) => ({
      header: (
        <Header
          navigation={navigation}
          title='Developer Tools'
          titleIcon='terminal'
          backBtn
        />
      ),
      tabBarVisible: false,
    }),
  }
)
