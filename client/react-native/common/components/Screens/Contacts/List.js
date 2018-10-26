import React, { PureComponent } from 'react'
import { Screen, Flex, Header, Text, Separator } from '../../Library'
import { colors } from '../../../constants'
import { Image, FlatList, ActivityIndicator } from 'react-native'
import { queries, fragments, subscriptions } from '../../../graphql'
import { QueryReducer } from '../../../relay'
import { marginLeft, padding } from '../../../styles'

const Item = fragments.Contact(
  ({
    data: { id, overrideDisplayName, displayName, displayStatus },
    navigation,
  }) => (
    <Flex.Cols
      align='center'
      onPress={() => {
        navigation.push('contacts/detail', {
          contact: {
            id,
            overrideDisplayName,
            displayName,
          },
        })
      }}
      style={[{ height: 72 }, padding]}
    >
      <Flex.Rows size={1} align='center'>
        <Image
          style={{ width: 40, height: 40, borderRadius: 20, margin: 4 }}
          source={{
            uri: 'https://api.adorable.io/avatars/40/' + id + '.png',
          }}
        />
      </Flex.Rows>
      <Flex.Rows size={7} align='stretch' justify='center' style={[marginLeft]}>
        <Text color={colors.black} left middle ellipsis>
          {overrideDisplayName || displayName}
        </Text>
        <Text color={colors.subtleGrey} tiny middle left ellipsis>
          {displayStatus}
        </Text>
      </Flex.Rows>
    </Flex.Cols>
  )
)

const List = fragments.ContactList(
  class List extends PureComponent {
    searchHandler = search => this.setState({ search })
    onEndReached = () => {
      if (!this.props.relay.hasMore() || this.props.relay.isLoading()) {
        return
      }
      this.props.relay.loadMore(50, console.error)
    }
    componentDidMount () {
      this.props.navigation.setParams({ searchHandler: this.searchHandler })
      this.subscribers = [
        subscriptions.contactRequest.subscribe({
          updater: (store, data) => this.props.retry && this.props.retry(),
        }),
        subscriptions.contactRequestAccepted.subscribe({
          updater: (store, data) => this.props.retry && this.props.retry(),
        }),
      ]
    }
    componentWillUnmount () {
      this.subscribers.forEach(subscriber => subscriber.unsubscribe())
    }

    keyExtractor = item => item.node.id

    render () {
      const { data, retry, relay } = this.props
      const edges = (data && data.ContactList && data.ContactList.edges) || []
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
            <Item data={node} navigation={this.props.navigation} />
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
        title='Contacts'
        titleIcon='feather-users'
        rightBtnIcon='user-plus'
        onPressRightBtn={() => navigation.push('contacts/add')}
        searchBar
        searchHandler={navigation.getParam('searchHandler')}
      />
    ),
    tabBarVisible: true,
  })

  render () {
    const { navigation } = this.props
    return (
      <Screen style={[{ backgroundColor: colors.white }]}>
        <QueryReducer
          query={queries.ContactList}
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
