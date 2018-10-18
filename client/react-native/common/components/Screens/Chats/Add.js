// TODO: create generic contact list with pagination

import React, { PureComponent } from 'react'
import { FlatList, Image, View, ActivityIndicator } from 'react-native'
import { Screen, Flex, Text, Separator, Header } from '../../Library'
import { colors } from '../../../constants'
import { marginHorizontal, border } from '../../../styles'
import { QueryReducer } from '../../../relay'
import { queries, subscriptions, mutations, fragments } from '../../../graphql'

const Item = fragments.Contact(
  class Item extends PureComponent {
    state = { selected: false }

    onPress = () => {
      this.setState({ selected: !this.state.selected }, this.props.onPress)
    }

    render () {
      const {
        data: { status, displayName, overrideDisplayName, displayStatus },
      } = this.props
      const { selected } = this.state
      return (
        <Flex.Cols
          align='start'
          onPress={this.onPress}
          style={[
            {
              backgroundColor: colors.white,
              paddingVertical: 16,
              height: 71,
            },
            marginHorizontal,
          ]}
        >
          <Flex.Rows size={1} align='start'>
            <Image
              style={{ width: 40, height: 40, borderRadius: 50 }}
              source={{
                uri:
                  'https://api.adorable.io/avatars/285/' +
                  ((status === 42 && 'Myself') ||
                    overrideDisplayName ||
                    displayName) +
                  '.png',
              }}
            />
          </Flex.Rows>
          <Flex.Rows size={6} align='start' style={{ marginLeft: 14 }}>
            <Text color={colors.black} left middle>
              {(status === 42 && 'Myself') ||
                overrideDisplayName ||
                displayName}
            </Text>
            <Text color={colors.subtleGrey} tiny>
              {displayStatus}
            </Text>
          </Flex.Rows>
          <Flex.Rows align='end' self='center'>
            <View
              style={[
                selected ? null : border,
                {
                  height: 18,
                  width: 18,
                  backgroundColor: selected ? colors.blue : colors.white,
                  borderRadius: 9,
                },
              ]}
            >
              <Text icon='check' padding middle center color={colors.white} />
            </View>
          </Flex.Rows>
        </Flex.Cols>
      )
    }
  }
)

const List = fragments.ContactList(
  class List extends PureComponent {
    onEndReached = () => {
      if (!this.props.relay.hasMore() || this.props.relay.isLoading()) {
        return
      }
      this.props.relay.loadMore(21, console.error)
    }
    componentDidMount () {
      const onSubmit = this.props.navigation.getParam('onSubmit')
      if (!onSubmit) {
        this.props.navigation.setParams({
          onSubmit: this.onSubmit(this.onDefaultSubmit),
        })
      } else {
        this.props.navigation.setParams({
          onSubmit: this.onSubmit(onSubmit),
        })
      }

      this.subscribers = [
        subscriptions.contactRequest.subscribe({
          updater: (store, data) => this.retry && this.retry(),
        }),
        subscriptions.contactRequestAccepted.subscribe({
          updater: (store, data) => this.retry && this.retry(),
        }),
      ]
    }

    componentWillUnmount () {
      this.subscribers.forEach(subscriber => subscriber.unsubscribe())
    }

    state = {
      contactsID: [],
    }

    onDefaultSubmit = async ({ contactsID }) => {
      const retry = this.props.navigation.getParam('retry')
      await mutations.conversationCreate.commit({
        title: '',
        topic: '',
        contacts: contactsID.map(id => ({
          id,
          displayName: '',
          displayStatus: '',
          overrideDisplayName: '',
          overrideDisplayStatus: '',
        })),
      })
      retry && retry()
      this.props.navigation.goBack(null)
    }

    onSubmit = onSubmit => async () => {
      try {
        await onSubmit(this.state)
      } catch (err) {
        console.error(err)
      }
    }

    render () {
      const { data, retry, relay } = this.props
      const edges = (data && data.ContactList && data.ContactList.edges) || []
      const { contactsID } = this.state
      return (
        <FlatList
          data={edges}
          ItemSeparatorComponent={({ highlighted }) => (
            <Separator highlighted={highlighted} />
          )}
          refreshing={relay.isLoading()}
          onRefresh={retry}
          onEndReached={this.onEndReached}
          renderItem={({ item: { node, cursor } }) => (
            <Item
              key={cursor}
              data={node}
              onPress={() => {
                const index = contactsID.lastIndexOf(node.id)
                index < 0
                  ? contactsID.push(node.id)
                  : contactsID.splice(index, 1)
                this.setState({ contactsID })
              }}
            />
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
        title='Add members'
        titleIcon='users'
        rightBtnIcon='check-circle'
        searchBar
        backBtn
        searchHandler={navigation.getParam('searchHandler')} // Placeholder
        onPressRightBtn={navigation.getParam('onSubmit')}
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
          variables={{
            filter: null,
            count: 21,
            cursor: '',
          }}
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
