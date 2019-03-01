import { createStackNavigator } from 'react-navigation'
import { Platform } from 'react-native'
import List from '../Screens/Chats/List'
import Detail from '../Screens/Chats/Detail'
import Add from '../Screens/Chats/Add'
import ChatSettingsNavigator from './ChatSettingsNavigator'

const handleNavigationsOptions = ({ navigation, screenProps }) => {
  let tabBarVisible = false

  if ((Platform.OS === 'web' && navigation.state.routeName === 'chats/list') ||
    (Platform.OS !== 'web' &&
      navigation.state.routes[navigation.state.index].routeName === 'chats/list')) {
    tabBarVisible = true
  }

  return {
    tabBarVisible,
  }
}

export default createStackNavigator(
  {
    'chats/list': List,
    'chats/add': Add,
    'chats/detail': Detail,
    'chats/settings': {
      screen: ChatSettingsNavigator,
      navigationOptions: () => ({
        header: null,
      }),
    },
  },
  {
    initialRouteName: 'chats/list',
    navigationOptions: handleNavigationsOptions,
  }
)
