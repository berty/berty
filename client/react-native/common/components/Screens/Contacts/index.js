import React from 'react'
import { createSubStackNavigator } from '../../../helpers/react-navigation'
import List from './List'
import Add from './Add'
import { Header, SelfAvatarIcon } from '../../Library'
import Detail from './Detail'

export default createSubStackNavigator(
  {
    'contacts/list': List,
    'contacts/add': {
      screen: Add,
      navigationOptions: ({ navigation }) => ({
        header: (
          <Header
            navigation={navigation}
            title='Add a contact'
            rightBtn={<SelfAvatarIcon />}
            rightBtnIcon={'save'}
            onPressRightBtn={() => {}}
            backBtn
          />
        ),
        tabBarVisible: true,
      }),
    },
    'contacts/detail': Detail,
  },
  {
    initialRouteName: 'contacts/list',
    tabBarVisible: false,
    header: null,
  },
)
