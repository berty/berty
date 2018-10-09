import React, { PureComponent } from 'react'
import { FlatList } from 'react-native'
import { Screen, Separator, Header, ListItem } from '../../Library'
import { colors } from '../../../constants'
import { QueryReducer } from '../../../relay'
import { subscriptions } from '../../../graphql'
import { createFragmentContainer, graphql } from 'react-relay'
import { conversation as utils } from '../../../utils'

class ListItemWrapper extends PureComponent {
  render () {
    const { data, navigation } = this.props
    return (
      <ListItem
        id={data.id}
        title={utils.getTitle(data)}
        subtitle='Last message sent 3 hours ago...' // Placeholder
        onPress={() => navigation.push('chats/detail', { conversation: data })}
      />
    )
  }
}

class List extends PureComponent {
  // TODO: implement pagination
  onEndReached = info => {
    // if (!this.props.relay.hasMore() || this.props.relay.isLoading()) {
    //   return
    // }
    // this.props.relay.loadMore(
    //   10, // Fetch the next 10 feed items
    //   error => {
    //     console.log(error)
    //   }
    // )
  }

  state = {
    search: '',
  }

  searchHandler = search => this.setState({ search })

  filter = ContactList => {
    const { search } = this.state
    if (search === '') {
      return ContactList
    } else {
      return ContactList.filter(
        entry =>
          entry.displayName.toLowerCase().indexOf(search.toLowerCase()) > -1
      )
    }
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

  render () {
    const { navigation, state, retry } = this.props
    const { data } = state
    const loading = state.type === state.loading
    return (
      <FlatList
        data={data.ConversationList || []}
        ItemSeparatorComponent={({ highlighted }) => (
          <Separator highlighted={highlighted} />
        )}
        onEndReached={this.onEndReached}
        refreshing={loading}
        onRefresh={retry}
        renderItem={data => (
          <ItemContainer
            key={data.item.id}
            data={data.item}
            separators={data.separators}
            navigation={navigation}
          />
        )}
      />
    )
  }
}

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
          query={graphql`
            query ListQuery {
              ConversationList {
                ...ListItem
              }
            }
          `}
        >
          {(state, retry) => {
            return <List navigation={navigation} state={state} retry={retry} />
          }}
        </QueryReducer>
      </Screen>
    )
  }
}

const ItemContainer = createFragmentContainer(
  ListItemWrapper,
  graphql`
    fragment ListItem on BertyEntityConversationPayload {
      id
      createdAt
      updatedAt
      title
      topic
      members {
        id
        status
        contactId
        contact {
          status
          displayName
          overrideDisplayName
        }
      }
    }
  `
)

// TODO: implement pagination
// const ListPaginationContainer = createPaginationContainer(
//   List,
//   {
//     query: graphql`
//       fragment List_query on Query {
//         ConversationList @connection(key: "List_items") {
//           edges {
//             node {
//               ...ListItem
//             }
//           }
//         }
//       }
//     `,
//   },
//   {
//     direction: 'forward',
//     getConnectionFromProps (props) {
//       return props.query && props.query.items
//     },
//     getVariables (props, { cursor }, fragmentVariables) {
//       return {
//         cursor,
//       }
//     },
//     variables: { cursor: null },
//     query: graphql`
//       query ListPaginationQuery($cursor: String) {
//         ...List_query
//       }
//     `,
//   }
// )
//
// // eslint-disable-next-line
// const ListQueryReducer = () => (
//   <QueryReducer
//     query={graphql`
//       query ListQuery($cursor: String) {
//         ...List_query
//       }
//     `}
//     variables={{ cursor: null }}
//   >
//     {(state, retry) => {
//       switch (state.type) {
//         default:
//         case state.loading:
//           return <List {...state} />
//         case state.success:
//           return <ListPaginationContainer {...state} />
//         case state.error:
//           return <Text>Error</Text>
//       }
//     }}
//   </QueryReducer>
// )
