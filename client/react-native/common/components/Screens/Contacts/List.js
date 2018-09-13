import React, { PureComponent } from 'react'
import { FlatList, TouchableOpacity, Image } from 'react-native'
import {
  Screen,
  Flex,
  Text,
  Separator,
  Header,
} from '../../Library'
import { colors } from '../../../constants'
import { marginHorizontal } from '../../../styles'
import { QueryReducer } from '../../../relay'
import { queries, subscriptions } from '../../../graphql'

// TODO: implement pagination

const Item = ({
  data: { id, displayName, overrideDisplayName },
  navigation,
}) => (
  <TouchableOpacity
    onPress={() => navigation.push('Detail', { id })}
    style={[
      {
        backgroundColor: colors.white,
        paddingVertical: 16,
        height: 71,
      },
      marginHorizontal,
    ]}
  >
    <Flex.Cols align='left'>
      <Flex.Rows size={1} align='left' style={{ marginLeft: 30 }}>
        <Image
          style={{ width: 40, height: 40, borderRadius: 50 }}
          source={{
            uri:
              'https://api.adorable.io/avatars/285/' +
              (overrideDisplayName || displayName) +
              '.png',
          }}
        />
      </Flex.Rows>
      <Flex.Rows size={6} align='left' style={{ marginLeft: 14 }}>
        <Text color={colors.black} left middle>
          {overrideDisplayName || displayName}
        </Text>
        <Text color={colors.subtleGrey} tiny>
          Last seen 3 hours ago ...
        </Text>
      </Flex.Rows>
    </Flex.Cols>
  </TouchableOpacity>
)

export default class List extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: <Header
      navigation={navigation}
      title='Contacts'
      titleIcon='feather-users'
      backBtn
      rightBtnIcon='user-plus'
      onPressRightBtn={() => navigation.push('Add')}
      searchBar
    />,
    tabBarVisible: true,
  })

  sortContacts = ContactList => {
    return ContactList.sort((a, b) => {
      let an = a['displayName'].toLowerCase()
      let bn = b['displayName'].toLowerCase()
      return an < bn ? -1 : an > bn ? 1 : 0
    })
  }

  componentDidMount () {
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

  render () {
    const { navigation } = this.props
    return (
      <Screen style={[{ backgroundColor: colors.white }]}>
        <QueryReducer query={queries.ContactList}>
          {(state, retry) =>
            (this.retry = retry) && (
              <FlatList
                data={this.sortContacts(
                  [].concat(state.data.ContactList || [])
                )}
                ItemSeparatorComponent={({ highlighted }) => (
                  <Separator highlighted={highlighted} />
                )}
                refreshing={state.type === state.loading}
                onRefresh={retry}
                renderItem={data => (
                  <Item
                    key={data.id}
                    data={data.item}
                    separators={data.separators}
                    navigation={navigation}
                  />
                )}
              />
            )
          }
        </QueryReducer>
      </Screen>
    )
  }
}
