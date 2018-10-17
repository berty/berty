import React, { PureComponent } from 'react'
import { Screen, Flex, Header, Text, Separator } from '../../Library'
import { colors } from '../../../constants'
import { TouchableOpacity, Image, FlatList } from 'react-native'
import { fragments, subscriptions } from '../../../graphql'
import { marginLeft, padding } from '../../../styles'

const Item = fragments.Contact(
  ({
    data: { id, overrideDisplayName, displayName, displayStatus },
    onPress,
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
          backgroundColor: colors.white,
          height: 72,
        },
        padding,
      ]}
    >
      <Flex.Cols align='center'>
        <Flex.Rows size={1} align='center'>
          <Image
            style={{ width: 40, height: 40, borderRadius: 20, margin: 4 }}
            source={{
              uri: 'https://api.adorable.io/avatars/285/' + id + '.png',
            }}
          />
        </Flex.Rows>
        <Flex.Rows
          size={7}
          align='stretch'
          justify='center'
          style={[marginLeft]}
        >
          <Text color={colors.black} left middle ellipsis>
            {overrideDisplayName || displayName}
          </Text>
          <Text color={colors.subtleGrey} tiny middle left ellipsis>
            {displayStatus}
          </Text>
        </Flex.Rows>
      </Flex.Cols>
    </TouchableOpacity>
  )
)

const List = fragments.ContactList(
  class List extends PureComponent {
    searchHandler = search => this.setState({ search })
    onEndReached = () => {
      if (!this.props.relay.hasMore() || this.props.relay.isLoading()) {
        return
      }
      this.props.relay.loadMore(21, console.error)
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
    render () {
      const { data, retry, navigation, relay } = this.props
      const edges = (data && data.ContactList && data.ContactList.edges) || []
      return (
        <FlatList
          data={edges}
          ItemSeparatorComponent={({ highlighted }) => (
            <Separator highlighted={highlighted} />
          )}
          refreshing={relay.isLoading()}
          onRefresh={retry}
          onEndReachedThreshold={0.7}
          onEndReached={this.onEndReached}
          renderItem={({ item: { node, cursor } }) => (
            <Item
              key={cursor}
              data={node}
              onPress={() =>
                navigation.push('contacts/detail', { id: node.id })
              }
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
    const {
      navigation,
      screenProps: { state, retry },
    } = this.props
    return (
      <Screen style={[{ backgroundColor: colors.white }]}>
        <List {...state} retry={retry} navigation={navigation} />
      </Screen>
    )
  }
}
