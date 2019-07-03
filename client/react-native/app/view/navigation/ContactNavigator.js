import React from 'react'
import { TouchableOpacity } from 'react-native'
import { createStackNavigator, createSwitchNavigator } from 'react-navigation'
import { Header } from '@berty/component'
import ContactTopNavigator from './ContactTopNavigator'
import AddContactMaterialNavigator from './ModalMaterialNavigator'
import List from '@berty/screen/Contacts/Detail/Detail'
import Edit from '@berty/screen/Contacts/Detail/Edit'
import I18n from 'i18next'
import { Avatar, Loader } from '@berty/component'
import { Store } from '@berty/container'

export const SplitSideContactNavigator = createStackNavigator(
  {
    'contacts/list': {
      screen: ContactTopNavigator,
      navigationOptions: ({ navigation }) => ({
        header: (
          <Header
            navigation={navigation}
            title={I18n.t('contacts.title')}
            titleIcon="feather-users"
            rightBtnIcon="user-plus"
            onPressRightBtn={() => navigation.navigate('contacts/add')}
          />
        ),
        tabBarVisible: true,
      }),
    },
  },
  {
    initialRouteName: 'contacts/list',
    tabBarVisible: false,
    header: null,
  }
)

export const SubviewsContactDetailsNavigator = createStackNavigator(
  {
    'contact/detail/list': List,
    'contact/detail/edit': Edit,
  },
  {
    initialRouteName: 'contact/detail/list',
    tabBarVisible: false,
    header: null,
  }
)

export const SubviewsContactAddNavigator = createStackNavigator(
  {
    'contacts/add': {
      screen: AddContactMaterialNavigator,
      navigationOptions: ({ navigation }) => ({
        header: (
          <Header
            navigation={navigation}
            title={I18n.t('contacts.add.title')}
            rightBtn={
              <Store.Entity.Contact status={42}>
                {data =>
                  data ? (
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate('modal/contacts/card', data)
                      }
                    >
                      <Avatar data={data} size={24} />
                    </TouchableOpacity>
                  ) : (
                    <Loader />
                  )
                }
              </Store.Entity.Contact>
            }
            backBtn
          />
        ),
        tabBarVisible: true,
      }),
    },
  },
  {
    initialRouteName: 'contacts/add',
    tabBarVisible: false,
    header: null,
  }
)

export const SubviewsContactNavigator = createSwitchNavigator({
  SubviewsContactDetailsNavigator,
  SubviewsContactAddNavigator,
})

export default createStackNavigator(
  {
    'contacts/home': SplitSideContactNavigator,
    'contacts/subviews': SubviewsContactNavigator,
  },
  {
    initialRouteName: 'contacts/home',
    tabBarVisible: false,
    header: null,
    headerMode: 'none',
  }
)
