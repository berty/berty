import { ActivityIndicator, FlatList } from 'react-native'
import React, { PureComponent } from 'react'

import { QueryReducer } from '../../../relay'
import { Screen, Separator, Header, ListItem } from '../../Library'
import { colors } from '../../../constants'
import { fragments, queries, subscriptions } from '../../../graphql'
import { conversation as utils } from '../../../utils'

const Item = fragments.Conversation(({ data, navigation, onPress }) => {
  return (
    <ListItem
      id={data.id}
      title={utils.getTitle(data)}
      subtitle='Last message sent 3 hours ago...' // Placeholder
      onPress={() => navigation.push('chats/detail', { conversation: data })}
    />
  )
})

const List = fragments.ConversationList(
  class List extends PureComponent {
    searchHandler = search => this.setState({ search })
    onEndReached = () => {
      console.log(this.props.relay.hasMore(), this.props.relay.isLoading())
      if (!this.props.relay.hasMore() || this.props.relay.isLoading()) {
        return
      }
      this.props.relay.loadMore(50, console.error)
    }

    componentDidMount () {
      this.props.navigation.setParams({
        searchHandler: this.searchHandler,
        retry: () => this.props.retry && this.props.retry(),
      })
      this.subscribers = [
        subscriptions.conversationInvite.subscribe({
          updater: (store, data) => this.props.retry && this.props.retry(),
        }),
      ]
    }

    keyExtractor = item => item.node.id

    render () {
      const { data, retry, relay, navigation } = this.props
      const edges =
        (data && data.ConversationList && data.ConversationList.edges) || []
      return (
        <FlatList
          data={edges}
          ItemSeparatorComponent={({ highlighted }) => (
            <Separator highlighted={highlighted} />
          )}
          refreshing={relay.isLoading()}
          onRefresh={retry}
          onEndReached={this.onEndReached}
          keyExtractor={this.props.keyExtractor}
          renderItem={({ item: { node, cursor } }) => (
            <Item data={node} navigation={navigation} />
          )}
        />
      )
    }
  }
)

export default class ListScreen extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header
        navigation={navigation}
        title='Chats'
        titleIcon='message-circle'
        rightBtnIcon='edit'
        searchBar
        searchHandler={navigation.getParam('searchHandler')} // Placeholder
        onPressRightBtn={() =>
          navigation.push('chats/add', {
            goBack: () => {
              navigation.goBack(null)
              const retry = navigation.getParam('retry')
              retry && retry()
            },
          })
        }
      />
    ),
    tabBarVisible: true,
  })

  render () {
    const { navigation } = this.props
    return (
      <Screen style={[{ backgroundColor: colors.white }]}>
        <QueryReducer
          query={queries.ConversationList}
          variables={{ filter: null, count: 50, cursor: '' }}
        >
          {(state, retry) => {
            switch (state.type) {
              default:
              case state.loading:
                return <ActivityIndicator size='large' />
              case state.success:
                return <List {...state} retry={retry} navigation={navigation} />
              case state.error:
                return null
            }
          }}
        </QueryReducer>
      </Screen>
    )
  }
}
