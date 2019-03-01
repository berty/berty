import React from 'react'
import { createStackNavigator } from 'react-navigation'
import { Header, SelfAvatarIcon } from '../Library'
import ContactTopNavigator from './ContactTopNavigator'
import AddContactMaterialNavigator from './ModalMaterialNavigator'
import List from '../Screens/Contacts/Detail/Detail'
import Edit from '../Screens/Contacts/Detail/Edit'
import I18n from 'i18next'

export default createStackNavigator(
  {
    'contacts/home': {
      screen: ContactTopNavigator,
      navigationOptions: ({ navigation }) => ({
        header: (
          <Header
            navigation={navigation}
            title={I18n.t('contacts.title')}
            titleIcon='feather-users'
            rightBtnIcon='user-plus'
            onPressRightBtn={() => navigation.navigate('contacts/add')}
          />
        ),
        tabBarVisible: true,
      }),
    },
    'contacts/add': {
      screen: AddContactMaterialNavigator,
      navigationOptions: ({ navigation }) => ({
        header: (
          <Header
            navigation={navigation}
            title={I18n.t('contacts.add.title')}
            rightBtn={<SelfAvatarIcon />}
            rightBtnIcon={'save'}
            onPressRightBtn={() => {}}
            backBtn
          />
        ),
        tabBarVisible: true,
      }),
    },
    'detail/list': List,
    'detail/edit': Edit,
  },
  {
    initialRouteName: 'contacts/home',
    tabBarVisible: false,
    header: null,
  },
)
