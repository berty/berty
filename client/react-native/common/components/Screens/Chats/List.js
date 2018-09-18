import React, { PureComponent } from 'react'
import { FlatList } from 'react-native'
import { Screen, Separator, Header, ListItem } from '../../Library'
import { colors } from '../../../constants'
import { QueryReducer } from '../../../relay'
import { subscriptions } from '../../../graphql'
import { createFragmentContainer, graphql } from 'react-relay'

const getTitle = ({ title, members } = this.props) =>
  title ||
  members.map((m, index) => {
    const displayName =
      m.contact.status === 'Myself'
        ? m.contact.status
        : m.contact.overrideDisplayName || m.contact.displayName
    const before =
      index === 0 ? '' : index === members.length - 1 ? ' and ' : ', '
    return `${before}${displayName}`
  })

class ListItemWrapper extends PureComponent {
  render () {
    const { data, navigation } = this.props
    return (
      <ListItem
        title={getTitle(data)}
        subtitle='Last message sent 3 hours ago...' // Placeholder
        onPress={() => navigation.push('Detail', { conversation: data })}
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

  render () {
    const { data, navigation, loading, retry } = this.props
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
        searchHandler={text => console.log(text)} // Placeholder
        onPressRightBtn={() => navigation.push('Add')}
      />
    ),
    tabBarVisible: true,
  })

  componentDidMount () {
    this.subscribers = [
      subscriptions.conversationInvite.subscribe({
        updater: (store, data) => this.retry && this.retry(),
      }),
    ]
  }

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
          {(state, retry) =>
            (this.retry = retry) && (
              <List
                navigation={navigation}
                data={state.data}
                loading={state.type === state.loading}
                retry={retry}
              />
            )
          }
        </QueryReducer>
      </Screen>
    )
  }
}

const ItemContainer = createFragmentContainer(
  ListItemWrapper,
  graphql`
    fragment ListItem on BertyEntityConversation {
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
