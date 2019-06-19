import { Platform } from 'react-native'
import { createBottomTabNavigator } from 'react-navigation'
import I18n from 'i18next'
import React, { Component } from 'react'

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

@withStoreContext
class TabBarIcon extends Component {
  constructor (props) {
    super(props)
    const { context } = props

    this.state = {
      stored: [],
      subscription:
        props.routeName === 'contacts'
          ? [context.node.service.contactRequest]
          : [context.node.service.message],
    }

    this.subscriber = null
  }

  eventUnseen = null

  async componentDidMount () {
    const { context } = this.props

    // const stream = await context.node.service.eventUnseen({})
    // stream.on('data', e => {
    //   if (this.state.stored.indexOf(e.targetAddr) === -1) {
    //     this.setState({
    //       stored: [...this.state.stored, e],
    //     })
    //   }
    // })
    this.subscriber = await context.node.service.commitLogStream({})
  }

  componentWillUnmount () {
    if (this.subscriber != null) {
      this.subscriber.destroy()
    }
  }

  updateBadge = (store, data) => {
    const [entity] = [data.CommitLogStream.entity.event]
    const {
      stored,
      queryVariables: {
        filter: { kind },
      },
    } = this.state

    if (entity && entity.kind === kind && entity.direction === 1) {
      if (entity.seenAt === null && stored.indexOf(entity.targetAddr) === -1) {
        this.setState({
          stored: [...stored, entity.targetAddr],
        })
      } else if (
        entity.seenAt !== null &&
        stored.indexOf(entity.targetAddr) !== -1
      ) {
        stored.splice(stored.indexOf(entity.targetAddr), 1)
        this.setState({
          stored: stored,
        })
      }
    }
  }

  contactSeen = async () => {
    // if (this.state.stored.length > 0) {
    //   for (const val of this.state.stored) {
    //     await this.props.context.node.service.eventSeen({
    //       id: val,
    //     })
    //   }
    //   this.setState({
    //     stored: [],
    //   })
    // }
  }

  render () {
    const { tintColor, routeName, navigation, context } = this.props
    const { stored } = this.state

    context.relay = context.environment
    let iconName = {
      contacts: 'users',
      chats: 'berty-berty_conversation',
      settings: 'settings',
    }[routeName]

    if (routeName === 'contacts' && navigation.isFocused() === true) {
      this.contactSeen()
    }

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
    ) : (
      <>
        <Icon.Badge
          name={iconName}
          size={24}
          color={tintColor}
          badge={stored.length > 0 ? '!' : ''}
          value={stored.length}
        />
      </>
    )
  }
}

const handleBothNavigationsOptions = ({ navigation }) => {
  return {
    tabBarIcon: function withTabBarIcon ({ tintColor, focused }) {
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
