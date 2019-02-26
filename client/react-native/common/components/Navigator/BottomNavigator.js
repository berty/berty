import ContactNavigator from './ContactNavigator'
import ChatNavigator from './ChatNavigator'
import SettingsNavigator from './SettingsNavigator'
import { createBottomTabNavigator } from 'react-navigation'
import { colors } from '../../constants'
import { Platform } from 'react-native'
import I18n from 'i18next'
import React from 'react'
import { Icon } from '../Library'

const TabBarIcon = (tintColor, routeName, badgeValue) => {
  let iconName = {
    contacts: 'users',
    chats: 'message-circle',
    settings: 'settings',
  }[routeName]
  console.log('routeName', routeName)
  return (
    <Icon.Badge
      name={iconName}
      size={24}
      color={tintColor}
      badge={badgeValue}
    />
  )
}

const handleBothNavigationsOptions = ({ navigation, screenProps }) => {
  let badge = null

  if (
    navigation.state.routeName === 'settings' &&
    screenProps.availableUpdate
  ) {
    badge = '!'
  }

  return {
    tabBarIcon: ({ tintColor }) =>
      TabBarIcon(tintColor, navigation.state.routeName, badge),
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
