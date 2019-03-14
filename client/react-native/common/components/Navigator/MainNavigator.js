import BottomNavigator, { SplitNavigator } from './BottomNavigator'
import { createStackNavigator } from 'react-navigation'
import { Easing, Animated, Platform } from 'react-native'
import { EventListFilterModal } from '../Screens/Settings/Devtools/EventList'
import ContactCardModal from '../Screens/Contacts/ContactCardModal'
import { ViewExportComponent } from '../../helpers/saveViewToCamera'

export default createStackNavigator(
  {
    tabs: Platform.OS === 'web' ? SplitNavigator : BottomNavigator,
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
