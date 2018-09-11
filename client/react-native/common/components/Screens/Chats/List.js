import React, { PureComponent } from 'react'
import { FlatList, TouchableOpacity, Image, View } from 'react-native'
import { Screen, Flex, Text, Separator } from '../../Library'
import { colors } from '../../../constants'
import {
  paddingLeft,
  paddingRight,
  padding,
  borderBottom,
} from '../../../styles'
import { QueryReducer } from '../../../relay'
import { createFragmentContainer, graphql } from 'react-relay'

class Item extends PureComponent {
  render () {
    const { data, navigation } = this.props
    const { title } = data
    return (
      <TouchableOpacity
        onPress={() => navigation.push('Detail', { conversation: data })}
        style={{
          backgroundColor: colors.white,
          paddingVertical: 16,
          height: 71,
        }}
      >
        <Flex.Cols align='left'>
          <Flex.Rows size={1} align='left' style={{ marginLeft: 30 }}>
            <Image
              style={{ width: 40, height: 40, borderRadius: 50 }}
              source={{
                uri: 'https://api.adorable.io/avatars/285/' + title + '.png',
              }}
            />
          </Flex.Rows>
          <Flex.Rows size={6} align='left' style={{ marginLeft: 14 }}>
            <Text color={colors.black} left middle>
              {title}
            </Text>
            <Text color={colors.subtleGrey} tiny>
              Last message sent 3 hours ago ...
            </Text>
          </Flex.Rows>
        </Flex.Cols>
      </TouchableOpacity>
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
        style={[paddingLeft, paddingRight]}
        ItemSeparatorComponent={({ highlighted }) => (
          <Separator highlighted={highlighted} />
        )}
        onEndReached={this.onEndReached}
        refreshing={loading}
        onRefresh={retry}
        renderItem={data => (
          <ItemContainer
            key={data.id}
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
  static Header = ({ navigation }) => (
    <View
      style={[
        { backgroundColor: colors.white, height: 56 },
        borderBottom,
        padding,
      ]}
    >
      <Flex.Cols size={1} align='start' space='between'>
        <Text icon='message-circle' left large color={colors.black}>
          Chats
        </Text>
      </Flex.Cols>
    </View>
  )

  static navigationOptions = ({ navigation }) => ({
    header: <ListScreen.Header navigation={navigation} />,
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
          {(state, retry) => (
            <List
              navigation={navigation}
              data={state.data}
              loading={state.type === state.loading}
              retry={retry}
            />
          )}
        </QueryReducer>
      </Screen>
    )
  }
}

const ItemContainer = createFragmentContainer(
  Item,
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
