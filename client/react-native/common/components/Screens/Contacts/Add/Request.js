import { ActivityIndicator, FlatList } from 'react-native'
import React, { PureComponent } from 'react'

import createTabNavigator from 'react-navigation-deprecated-tab-navigator/src/createTabNavigator'

import { ListItem, Screen, Separator } from '../../../Library'
import { QueryReducer } from '../../../../relay'
import { borderBottom } from '../../../../styles'
import { colors } from '../../../../constants'
import { fragments, queries, subscriptions } from '../../../../graphql'

const Item = fragments.Contact(({ data, onPress }) => (
  <ListItem
    id={data.id}
    title={data.overrideDisplayName || data.displayName}
    subtitle=''
    onPress={onPress}
  />
))

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

  onPressItem = id => () => {
    this.props.navigation.push('contacts/add/request-validation', { id })
  }

  render () {
    const { data, relay } = this.props
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
          <Item data={node} onPress={this.onPressItem(node.id)} />
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
