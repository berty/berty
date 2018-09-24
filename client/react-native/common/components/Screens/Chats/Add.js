// TODO: create generic contact list with pagination

import React, { PureComponent } from 'react'
import { FlatList, TouchableOpacity, Image, View } from 'react-native'
import { Screen, Flex, Text, Separator, Header } from '../../Library'
import { colors } from '../../../constants'
import { marginHorizontal, border } from '../../../styles'
import { QueryReducer } from '../../../relay'
import { queries, subscriptions, mutations } from '../../../graphql'

class Item extends PureComponent {
  state = { selected: false }

  onPress = () => {
    this.setState({ selected: !this.state.selected }, this.props.onPress)
  }

  render () {
    const {
      data: { status, displayName, overrideDisplayName },
    } = this.props
    const { selected } = this.state
    return (
      <TouchableOpacity
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
        <Flex.Cols align='start'>
          <Flex.Rows size={1} align='start'>
            <Image
              style={{ width: 40, height: 40, borderRadius: 50 }}
              source={{
                uri:
                  'https://api.adorable.io/avatars/285/' +
                  ((status === 'Myself' && status) ||
                    overrideDisplayName ||
                    displayName) +
                  '.png',
              }}
            />
          </Flex.Rows>
          <Flex.Rows size={6} align='start' style={{ marginLeft: 14 }}>
            <Text color={colors.black} left middle>
              {(status === 'Myself' && status) ||
                overrideDisplayName ||
                displayName}
            </Text>
            <Text color={colors.subtleGrey} tiny>
              Last seen 3 hours ago ...
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
      </TouchableOpacity>
    )
  }
}

export default class List extends PureComponent {
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

  sortContacts = ContactList => {
    return ContactList.sort((a, b) => {
      let an = a['displayName'].toLowerCase()
      let bn = b['displayName'].toLowerCase()
      return an < bn ? -1 : an > bn ? 1 : 0
    })
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
    await mutations.conversationCreate.commit({ contactsID })
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
    const { navigation } = this.props
    const { contactsID } = this.state
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
                    key={data.item.id}
                    data={data.item}
                    separators={data.separators}
                    navigation={navigation}
                    onPress={() => {
                      const index = contactsID.lastIndexOf(data.item.id)
                      index < 0
                        ? contactsID.push(data.item.id)
                        : contactsID.splice(index, 1)
                      this.setState({ contactsID })
                    }}
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
