import { Animated, Easing, Platform, View } from 'react-native'
import {
  createStackNavigator,
  createBottomTabNavigator,
  createSwitchNavigator,
  withNavigation,
} from 'react-navigation'
import React from 'react'

import { EventListFilterModal } from './Settings/Devtools/EventList'
import { Icon } from '../Library'
import { colors } from '../../constants'
import Chats from './Chats'
import Contacts from './Contacts'
import Settings from './Settings'
import ContactCardModal from './Contacts/ContactCardModal'
import { ViewExportComponent } from '../../helpers/saveViewToCamera'
import I18n from 'i18next'
import Onboarding from './Accounts/Onboarding'

const TabBarIcon = (tintColor, routeName, badgeValue) => {
  let iconName = {
    contacts: 'users',
    chats: 'message-circle',
    settings: 'settings',
  }[routeName]

  return (
    <Icon.Badge
      name={iconName}
      size={24}
      color={tintColor}
      badge={badgeValue}
    />
  )
}

export const tabs = createBottomTabNavigator(
  {
    contacts: {
      screen: Contacts,
      navigationOptions: () => ({
        title: I18n.t('contacts.title'),
      }),
    },
    chats: {
      screen: Chats,
      navigationOptions: () => ({
        title: I18n.t('chats.title'),
      }),
    },
    settings: {
      screen: Settings,
      navigationOptions: () => ({
        title: I18n.t('settings.title'),
      }),
    },
  },
  {
    initialRouteName: 'chats',
    swipeEnabled: false,
    animationEnabled: true,
    defaultNavigationOptions: ({ navigation, screenProps }) => {
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
    },
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

class Picker extends React.Component {
  constructor (props) {
    super(props)

    this.props.navigation.navigate(
      // TODO: when will find a way to use all our components in Library, implement skip of onboarding in test replace the next line by:
      //     this.props.screenProps.firstLaunch || process.env['ENVIRONMENT'] === 'integration_test'
      this.props.screenProps.firstLaunch && process.env['ENVIRONMENT'] !== 'integration_test'
        ? 'switch/onboarding'
        : 'switch/main'
    )
  }

  render () {
    return <View />
  }
}

// Navigator handling modals
const Main = createStackNavigator(
  {
    tabs: tabs,
    'main/onboarding': Onboarding,
    'modal/devtools/event/list/filters': {
      screen: EventListFilterModal,
    },
    'modal/contacts/card': {
      screen: ContactCardModal,
    },
    'virtual/view-export': {
      screen: ViewExportComponent,
    },
  },
  {
    mode: 'card',
    headerMode: 'none',
    transparentCard: true,
    navigationOptions: {
      gesturesEnabled: false,
    },
    transitionConfig: () => ({
      transitionSpec: {
        duration: 300,
        easing: Easing.out(Easing.poly(4)),
        timing: Animated.timing,
      },
      screenInterpolator: sceneProps => {
        const { layout, position, scene } = sceneProps
        const { index } = scene

        const height = layout.initHeight
        const translateY = position.interpolate({
          inputRange: [index - 1, index, index + 1],
          outputRange: [height, 0, 0],
        })

        const opacity = position.interpolate({
          inputRange: [index - 1, index - 0.99, index],
          outputRange: [0, 1, 1],
        })

        return { opacity, transform: [{ translateY }] }
      },
    }),
  }
)

const mainNavigator = createSwitchNavigator({
  'switch/picker': Picker,
  'switch/onboarding': Onboarding,
  'switch/main': Main,
})

export default withNavigation(mainNavigator)
