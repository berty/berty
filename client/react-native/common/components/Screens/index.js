import React, { Fragment, PureComponent } from 'react'
import createTabNavigator from 'react-navigation-deprecated-tab-navigator/src/createTabNavigator'
import { Animated, Easing } from 'react-native'
import { createStackNavigator } from 'react-navigation'
import Contacts from './Contacts'
import Chats from './Chats'
import Settings from './Settings'
import { colors } from '../../constants'
import { ByPublicKeyModal } from './Contacts/Add/ByPublicKey'
import { EventListFilterModal } from './Settings/Devtools/EventList'
import IconFeather from 'react-native-vector-icons/dist/Feather'


export const mainTabs = createTabNavigator(
  {
    contacts: Contacts,
    chats: Chats,
    settings: Settings,
  },
  {
    initialRouteName: 'chats',
    swipeEnabled: true,
    animationEnabled: true,
    tabBarPosition: 'bottom',
    navigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, tintColor }) => {
        const { routeName } = navigation.state;
        let iconName;
        if (routeName === 'contacts') {
          iconName = 'users';
        } else if (routeName === 'chats') {
          iconName = 'message-circle';
        } else if (routeName === 'settings') {
          iconName = 'settings';
        }
        return <IconFeather name={iconName} size={25} color={tintColor} />;
      },
    }),
    tabBarTextFontSize: 22,
    tabBarOptions: {
      activeTintColor: colors.fakeBlack,
      inactiveTintColor: colors.lightGrey,
      indicatorStyle: {
        backgroundColor: colors.fakeBlack,
      },
      style: [
        {
          backgroundColor: colors.white,
          paddingTop: 8,
          paddingBottom:10,
          fontSize: 50,
          height:63,
          borderTopWidth: 0.5,
          borderTopColor: colors.borderGrey,
          shadowColor: colors.shadowGrey,
          shadowOffset: { height: -5, width: 0 },
          shadowOpacity: 0.2,
          shadowRadius: 5,
        },
      ],
    },
  },
)

// Navigator handling modals
export default createStackNavigator(
  {
    'main': {
      screen: mainTabs,
    },
    'modal/contacts/add/by-public-key': {
      screen: ByPublicKeyModal,
    },
    'modal/devtools/event/list/filters': {
      screen: EventListFilterModal,
    },
  },
  {
    mode: 'card',
    headerMode: 'none',
    transparentCard: true,
    cardStyle: [
      {
        backgroundColor: colors.transparentGrey,
      },
    ],
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
  },
)
