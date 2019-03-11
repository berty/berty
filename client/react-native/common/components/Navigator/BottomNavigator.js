import ContactNavigator from './ContactNavigator'
import ChatNavigator from './ChatNavigator'
import SettingsNavigator from './SettingsNavigator'
import { createBottomTabNavigator } from 'react-navigation'
import { colors } from '../../constants'
import { Platform } from 'react-native'
import I18n from 'i18next'
import React, { Component } from 'react'
import { Icon } from '../Library'
import { UpdateContext } from '../../update'
import { RelayContext } from '../../relay'

class TabBarIcon extends Component {
  constructor (props) {
    super(props)
    this.state = {
      stored: [],
      entityKind: props.routeName === 'chats' ? 302 : 201,
    }
    this.subscriber = null
  }

  componentWillUnmount () {
    if (this.subscriber != null) {
      this.subscriber.unsubscribe()
    }
  }

  componentDidUpdate = (prevProps) => {
    if (this.props.focused !== prevProps.focused && this.props.focused === true) {
      this.setState({
        stored: [],
      })
    }
  }

  updateBadge = (store, data) => {
    const { entityKind, stored } = this.state
    const { focused } = this.props
    const [operation, entity] = [
      data.CommitLogStream.operation,
      data.CommitLogStream.entity.event,
    ]

    if (focused !== true && operation === 0 && entity &&
      entity.kind === entityKind && stored.indexOf(entity.id) === -1) {
      this.setState({
        stored: [
          ...stored,
          entity.id,
        ],
      })
    }
  }

  render () {
    const { tintColor, routeName } = this.props
    const { stored } = this.state

    let iconName = {
      contacts: 'users',
      chats: 'message-circle',
      settings: 'settings',
    }[routeName]

    return routeName === 'settings'
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
          <RelayContext.Consumer>
            {({ subscriptions }) => {
              this.subscriber = subscriptions.commitLogStream.subscribe({
                updater: this.updateBadge,
              })
            }}
          </RelayContext.Consumer>
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
      return (<TabBarIcon tintColor={tintColor} focused={focused} routeName={navigation.state.routeName} />)
    },
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
