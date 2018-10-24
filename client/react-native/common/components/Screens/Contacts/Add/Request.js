import { ActivityIndicator, FlatList, Image } from 'react-native'
import React, { PureComponent } from 'react'

import createTabNavigator from 'react-navigation-deprecated-tab-navigator/src/createTabNavigator'

import { Flex, Screen, Separator, Text } from '../../../Library'
import { QueryReducer } from '../../../../relay'
import { borderBottom, padding } from '../../../../styles'
import { colors } from '../../../../constants'
import {
  mutations,
  fragments,
  queries,
  subscriptions,
} from '../../../../graphql'

const Item = fragments.Contact(
  class Item extends PureComponent {
    static isLoading = {}

    onAccept = async () => {
      const { id } = this.props.data
      Item.isLoading[id] = true
      this.forceUpdate()
      try {
        await mutations.contactAcceptRequest({ id })
      } catch (err) {
        console.error(err)
      }
    }

    onDecline = async () => {
      const { id } = this.props.data
      Item.isLoading[id] = true
      this.forceUpdate()
      try {
        await mutations.contactRemove({ id })
      } catch (err) {
        console.error(err)
      }
    }

    onRemove = async () => {
      const { id } = this.props.data
      Item.isLoading[id] = true
      this.forceUpdate()
      try {
        await mutations.contactRemove({ id })
      } catch (err) {
        console.error(err)
      }
    }

    render () {
      const {
        data: { id, overrideDisplayName, displayName },
        navigation,
      } = this.props
      return (
        <Flex.Cols align='center' style={[{ height: 72 }, padding]}>
          <Flex.Cols size={4} justify='start'>
            <Image
              style={{ width: 40, height: 40, borderRadius: 20, margin: 4 }}
              source={{
                uri: 'https://api.adorable.io/avatars/40/' + id + '.png',
              }}
            />
            <Flex.Rows>
              <Text
                color={colors.black}
                left
                middle
                ellipsis
                margin={{ left: 16 }}
              >
                {overrideDisplayName || displayName}
              </Text>
            </Flex.Rows>
          </Flex.Cols>
          {Item.isLoading[id] && (
            <Flex.Cols size={1} justify='end'>
              <ActivityIndicator />
            </Flex.Cols>
          )}
          {!Item.isLoading[id] &&
            (navigation.state.routeName === 'Received' ? (
              <Flex.Cols size={4}>
                <Text
                  icon='check'
                  background={colors.blue}
                  color={colors.white}
                  margin={{ left: 8 }}
                  padding={{
                    vertical: 6,
                    horizontal: 4,
                  }}
                  middle
                  center
                  shadow
                  tiny
                  rounded={22}
                  onPress={this.onAccept}
                >
                  ACCEPT
                </Text>
                <Text
                  icon='x'
                  background={colors.white}
                  color={colors.subtleGrey}
                  margin={{ left: 8 }}
                  padding={{
                    vertical: 6,
                    horizontal: 4,
                  }}
                  middle
                  center
                  tiny
                  shadow
                  self='end'
                  rounded={22}
                  onPress={this.onDecline}
                >
                  DECLINE
                </Text>
              </Flex.Cols>
            ) : (
              <Flex.Cols size={1.6}>
                <Text
                  icon='x'
                  background={colors.white}
                  color={colors.subtleGrey}
                  margin={{ left: 8 }}
                  padding={{
                    vertical: 6,
                    horizontal: 4,
                  }}
                  middle
                  center
                  tiny
                  shadow
                  self='end'
                  rounded={22}
                  onPress={this.onRemove}
                >
                  REMOVE
                </Text>
              </Flex.Cols>
            ))}
        </Flex.Cols>
      )
    }
  }
)

class List extends PureComponent {
  onEndReached = () => {
    if (!this.props.relay.hasMore() || this.props.relay.isLoading()) {
      return
    }
    this.props.relay.loadMore(10, console.error)
  }
  componentDidMount () {
    this.props.navigation.setParams({ searchHandler: this.searchHandler })
    this.subscribers = [
      subscriptions.contactRequest.subscribe({
        updater: (store, data) => {
          // TODO
          console.log('not implemented')
        },
      }),
      subscriptions.contactRequestAccepted.subscribe({
        updater: (store, data) => {
          // TODO
          console.log('not implemented')
        },
      }),
    ]
  }
  componentWillUnmount () {
    this.subscribers.forEach(subscriber => subscriber.unsubscribe())
  }
  render () {
    const { data, relay, navigation } = this.props
    const edges = (data && data.ContactList && data.ContactList.edges) || []
    return (
      <FlatList
        data={edges}
        ItemSeparatorComponent={({ highlighted }) => (
          <Separator highlighted={highlighted} />
        )}
        refreshing={relay.isLoading()}
        onEndReached={this.onEndReached}
        keyExtractor={this.props.keyExtractor}
        renderItem={({ item: { node, cursor } }) => (
          <Item data={node} navigation={navigation} />
        )}
      />
    )
  }
}

const ReceivedList = fragments.ContactList.Received(List)
const SentList = fragments.ContactList.Sent(List)

class Request extends PureComponent {
  render () {
    const { navigation } = this.props
    const {
      state: { routeName },
    } = navigation

    return (
      <Screen style={[{ backgroundColor: colors.white }]}>
        <QueryReducer
          query={queries.ContactList[routeName]}
          variables={queries.ContactList[routeName].defaultVariables}
        >
          {(state, retry) => {
            switch (state.type) {
              default:
              case state.loading:
                return <ActivityIndicator size='large' />
              case state.success:
                return routeName === 'Received' ? (
                  <ReceivedList
                    {...state}
                    retry={retry}
                    navigation={navigation}
                  />
                ) : (
                  <SentList {...state} retry={retry} navigation={navigation} />
                )
              case state.error:
                return null
            }
          }}
        </QueryReducer>
      </Screen>
    )
  }
}

export default createTabNavigator(
  {
    Received: Request,
    Sent: Request,
  },
  {
    initialRouteName: 'Received',
    swipeEnabled: true,
    animationEnabled: true,
    tabBarPosition: 'top',

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
          borderTopWidth: 0,
        },
        borderBottom,
      ],
    },
  }
)
