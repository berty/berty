import createTabNavigator from 'react-navigation-deprecated-tab-navigator/src/createTabNavigator'
import { Animated, Easing } from 'react-native'
import { createStackNavigator } from 'react-navigation'
import Contacts from './Contacts'
import Chats from './Chats'
import Settings from './Settings'
import { colors } from '../../constants'
import { borderTop, shadow } from '../../styles'
import { ByPublicKeyModal } from './Contacts/Add/ByPublicKey'
import { EventListFilterModal } from './Settings/Devtools/EventList'

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
    tabBarOptions: {
      labelStyle: {
        color: colors.black,
      },
      indicatorStyle: {
        backgroundColor: colors.black,
      },
      style: [
        {
          backgroundColor: colors.white,
        },
        borderTop,
        shadow,
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
