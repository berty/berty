import ContactNavigator, {
  SplitSideContactNavigator, SubviewsContactNavigator,
} from './ContactNavigator'
import ChatNavigator, {
  SubviewsChatNavigator,
  SplitSideChatNavigator,
} from './ChatNavigator'
import SettingsNavigator from './SettingsNavigator'
import { createBottomTabNavigator } from 'react-navigation'
import { Platform } from 'react-native'
import I18n from 'i18next'
import React, { Component } from 'react'
import { colors } from '../../constants'
import { Icon } from '../Library'
import { UpdateContext } from '../../update'
import { createSplitNavigator } from './SplitNavigator'
import Placeholder from '../Screens/Placeholder'
import withRelayContext from '../../helpers/withRelayContext'
import { fragments } from '../../graphql'
import { Pagination } from '../../relay'
import { merge } from '../../helpers'

class TabBarIconBase extends Component {
  constructor (props) {
    super(props)

    const {
      context: {
        queries,
        subscriptions,
      },
    } = props

    this.state = {
      shouldRefresh: false,
      stored: [],
      queryList: queries.EventList.graphql,
      queryVariables: props.routeName === 'contacts' || props.routeName === 'side/contacts'
        ? merge([queries.EventList.defaultVariables, {
          filter: {
            kind: 201,
            direction: 1,
          },
          onlyWithoutSeenAt: 1,
        }])
        : merge([queries.EventList.defaultVariables, {
          filter: {
            kind: 302,
            direction: 1,
          },
        }]),
      subscription: props.routeName === 'contacts' || props.routeName === 'side/contacts'
        ? [subscriptions.contactRequest]
        : [subscriptions.message],
    }
  }

  componentWillUnmount () {
    if (this.subscriber != null) {
      this.subscriber.unsubscribe()
    }
  }

  item = (props) => {
    const {
      data: { id, seenAt },
    } = props
    const { routeName } = this.props
    let { stored } = this.state
    const idx = stored.indexOf(id)

    if (idx === -1 && seenAt === null) {
      this.setState({
        stored: [
          ...stored,
          id,
        ],
      })
    } else if (idx !== -1 && (routeName === 'chats' || routeName === 'side/chats') && new Date(seenAt).getTime() > 0) {
      stored.splice(stored.indexOf(id), 1)
      this.setState({
        stored,
      })
    }

    return null
  }

  contactSeen = async () => {
    if (this.state.stored.length > 0) {
      await Promise.all(this.state.stored.map((val) => {
        return this.props.context.mutations.eventSeen({
          id: val,
        })
      }))

      this.setState({
        stored: [],
      })
    }
  }

  fragment = fragments.Event(this.item)

  render () {
    const {
      tintColor,
      routeName,
      navigation,
      context,
    } = this.props
    const {
      stored,
      queryList,
      queryVariables,
      subscription,
    } = this.state

    context.relay = context.environment
    let iconName = {
      contacts: 'users',
      chats: 'message-circle',
      settings: 'settings',
      'side/contacts': 'users',
      'side/chats': 'message-circle',
      'side/settings': 'settings',
    }[routeName]

    if ((routeName === 'contacts' || routeName === 'side/contacts') && navigation.isFocused() === true) {
      this.contactSeen()
    }

    return routeName === 'settings' || routeName === 'side/settings'
      ? (
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
          <Pagination
            direction='forward'
            noLoader
            query={queryList}
            variables={queryVariables}
            fragment={fragments.EventList}
            alias={'EventList'}
            subscriptions={subscription}
            renderItem={props => (
              <this.fragment {...props} context={context} />
            )}
            style={{ display: 'none' }}
            emptyItem={() => null}
          />
        </>
      )
  }
}

const TabBarIcon = withRelayContext(TabBarIconBase)

const handleBothNavigationsOptions = ({ navigation }) => {
  return {
    tabBarIcon: function withTabBarIcon ({ tintColor, focused }) {
      return (<TabBarIcon tintColor={tintColor} focused={focused} navigation={navigation} routeName={navigation.state.routeName} />)
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
  options,
)

export const SplitNavigator = createSplitNavigator({
  'placeholder': Placeholder,
  'contacts': SubviewsContactNavigator,
  'chats/subviews': SubviewsChatNavigator,
}, {
  'side/contacts': {
    screen: SplitSideContactNavigator,
    navigationOptions: () => ({
      title: I18n.t('contacts.title'),
    }),
  },
  'side/chats': {
    screen: SplitSideChatNavigator,
    navigationOptions: () => ({
      title: I18n.t('chats.title'),
    }),
  },
  'side/settings': {
    screen: SettingsNavigator,
    navigationOptions: () => ({
      title: I18n.t('settings.title'),
    }),
  },
}, {}, {
  ...options,
  backBehavior: 'none',
  initialRouteName: 'side/chats',
})
