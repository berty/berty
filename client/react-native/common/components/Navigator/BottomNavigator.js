import ContactNavigator from './ContactNavigator'
import ChatNavigator from './ChatNavigator'
import SettingsNavigator from './SettingsNavigator'
import { createBottomTabNavigator } from 'react-navigation'
import { colors } from '../../constants'
import { Platform } from 'react-native'
import I18n from 'i18next'
import React from 'react'
import { Icon } from '../Library'
import { UpdateContext } from '../../update'

const TabBarIcon = (tintColor, routeName) => {
  let iconName = {
    contacts: 'users',
    chats: 'message-circle',
    settings: 'settings',
  }[routeName]

  return (
    <UpdateContext.Consumer>
      {({ availableUpdate }) => (
        <Icon.Badge
          name={iconName}
          size={24}
          color={tintColor}
          badge={routeName === 'settings' && availableUpdate ? '!' : ''}
        />
      )}
    </UpdateContext.Consumer>
  )
}

const handleBothNavigationsOptions = ({ navigation }) => {
  return {
    tabBarIcon: ({ tintColor }) =>
      TabBarIcon(tintColor, navigation.state.routeName),
  }
}

export default createBottomTabNavigator(
  {
    contacts: {
      screen: ContactNavigator,
      navigationOptions: () => ({
        title: I18n.t('contacts.title'),
      }),
    },
    chats: {
      screen: ChatNavigator,
      navigationOptions: () => ({
        title: I18n.t('chats.title'),
      }),
    },
    settings: {
      screen: SettingsNavigator,
      navigationOptions: () => ({
        title: I18n.t('settings.title'),
      }),
    },
  },
  {
    initialRouteName: 'chats',
    swipeEnabled: false,
    // animationEnabled: true,
    navigationOptions: handleBothNavigationsOptions,
    defaultNavigationOptions: handleBothNavigationsOptions,
    tabBarOptions: {
      showIcon: true,
      showLabel: true,
      upperCaseLabel: false,
      activeTintColor: colors.fakeBlack,
      inactiveTintColor: colors.lightGrey,
      indicatorStyle: {
        backgroundColor: colors.fakeBlack,
      },
      style: [
        {
          backgroundColor: colors.white,
          borderTopWidth: 0.5,
          borderTopColor: colors.borderGrey,
          shadowColor: colors.shadowGrey,
          shadowOffset: { height: -5, width: 0 },
          shadowOpacity: 0.2,
          shadowRadius: 5,
          ...(Platform.OS === 'android'
            ? { height: 68, paddingTop: 3 }
            : { height: 64, paddingTop: 5, paddingBottom: 6 }),
        },
      ],
    },
  }
)
