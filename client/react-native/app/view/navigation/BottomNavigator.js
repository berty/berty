import { Platform } from 'react-native'
import { createBottomTabNavigator } from 'react-navigation'
import I18n from 'i18next'
import React, { PureComponent } from 'react'

import { Icon } from '@berty/component'
import { UpdateContext } from '@berty/update'
import { colors } from '@berty/common/constants'
import { createSplitNavigator } from './SplitNavigator'
import ChatNavigator, {
  SubviewsChatNavigator,
  SplitSideChatNavigator,
} from './ChatNavigator'
import ContactNavigator, {
  SplitSideContactNavigator,
  SubviewsContactNavigator,
} from './ContactNavigator'
import Placeholder from '@berty/screen/Placeholder'
import SettingsNavigator from './SettingsNavigator'
import { withStoreContext } from '@berty/store/context'
import { Store } from '@berty/container'
import { debounce } from 'throttle-debounce'

@withStoreContext
class TabBarIcon extends PureComponent {
  async componentDidMount() {
    const { context } = this.props
    this.commitLogStream = await context.node.service.commitLogStream()
    this.commitLogStream.on('data', ({ entity }) => {
      if (entity.conversation || entity.contact) {
        this.smartForceUpdate()
      }
    })
  }

  componentWillUnmount() {
    this.commitLogStream && this.commitLogStream.destroy()
  }

  smartForceUpdate = debounce(16, this.forceUpdate)

  render() {
    const { tintColor, routeName, context } = this.props

    context.relay = context.environment
    let iconName = {
      contacts: 'users',
      chats: 'berty-berty_conversation',
      settings: 'settings',
    }[routeName]

    return routeName === 'settings' ? (
      <UpdateContext.Consumer>
        {({ availableUpdate }) => (
          <Icon.Badge
            name={iconName}
            size={24}
            color={tintColor}
            badge={availableUpdate ? '!' : ''}
          />
        )}
      </UpdateContext.Consumer>
    ) : routeName === 'contacts' ? (
      <Store.Node.Service.ContactListBadge request={{}}>
        {({ response: badge }) => (
          <Icon.Badge
            name={iconName}
            size={24}
            color={tintColor}
            value={badge && badge.value}
          />
        )}
      </Store.Node.Service.ContactListBadge>
    ) : (
      <Store.Node.Service.ConversationListBadge request={{}}>
        {({ response: badge }) => (
          <Icon.Badge
            name={iconName}
            size={24}
            color={tintColor}
            value={badge && badge.value}
          />
        )}
      </Store.Node.Service.ConversationListBadge>
    )
  }
}

const handleBothNavigationsOptions = ({ navigation }) => {
  return {
    tabBarIcon: function withTabBarIcon({ tintColor, focused }) {
      return (
        <TabBarIcon
          tintColor={tintColor}
          focused={focused}
          navigation={navigation}
          routeName={navigation.state.routeName}
        />
      )
    },
  }
}

const options = {
  initialRouteName: 'chats',
  swipeEnabled: false,
  // animationEnabled: true,
  navigationOptions: handleBothNavigationsOptions,
  defaultNavigationOptions: handleBothNavigationsOptions,
  tabBarOptions: {
    showIcon: true,
    showLabel: false,
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
        shadowOffset: { height: Platform.OS === 'web' ? 0 : -5, width: 0 },
        shadowOpacity: 0.2,
        shadowRadius: Platform.OS === 'web' ? 5 : 3,
        ...(Platform.OS === 'android'
          ? { height: 54, paddingTop: 3 }
          : { height: 50.5, paddingTop: 5, paddingBottom: 6 }),
      },
    ],
  },
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
  options
)

export const SplitNavigator = createSplitNavigator(
  {
    placeholder: Placeholder,
    'contacts/subviews': SubviewsContactNavigator,
    'chats/subviews': SubviewsChatNavigator,
  },
  {
    contacts: {
      screen: SplitSideContactNavigator,
      navigationOptions: () => ({
        title: I18n.t('contacts.title'),
      }),
    },
    chats: {
      screen: SplitSideChatNavigator,
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
  {},
  {
    ...options,
    backBehavior: 'none',
    initialRouteName: 'chats',
  }
)
