// TODO: create generic contact list with pagination

import React, { PureComponent } from 'react'
import {
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  View,
} from 'react-native'
import { Screen, Flex, Text, Separator } from '../../Library'
import { colors } from '../../../constants'
import {
  paddingLeft,
  paddingRight,
  marginHorizontal,
  padding,
  borderBottom,
  paddingBottom,
  border,
} from '../../../styles'
import { QueryReducer } from '../../../relay'
import { queries, subscriptions, mutations } from '../../../graphql'

const Header = ({ navigation, onPressRight }) => (
  <View
    style={[
      { backgroundColor: colors.white, height: 100 },
      borderBottom,
      padding,
    ]}
  >
    <Flex.Rows>
      <Flex.Cols
        size={1}
        align='center'
        space='between'
        style={[paddingBottom]}
      >
        <Text
          icon='arrow-left'
          large
          right
          button
          color={colors.black}
          onPress={() => navigation.goBack(null)}
        />
        <Text icon='feather-users' left large color={colors.black}>
          Add members
        </Text>
        <Text
          icon='check-circle'
          large
          right
          button
          color={colors.black}
          onPress={onPressRight}
        />
      </Flex.Cols>
      <Flex.Cols size={1} style={[paddingBottom]}>
        <TextInput
          style={[
            {
              height: 36,
              flex: 1,
              backgroundColor: colors.grey7,
              borderWidth: 0,
              borderRadius: 18,
            },
            paddingLeft,
            paddingRight,
          ]}
          placeholder='Search'
        />
      </Flex.Cols>
    </Flex.Rows>
  </View>
)

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
        <Flex.Cols align='left'>
          <Flex.Rows size={1} align='left' style={{ marginLeft: 30 }}>
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
          <Flex.Rows size={6} align='left' style={{ marginLeft: 14 }}>
            <Text color={colors.black} left middle>
              {(status === 'Myself' && status) ||
                overrideDisplayName ||
                displayName}
            </Text>
            <Text color={colors.subtleGrey} tiny>
              Last seen 3 hours ago ...
            </Text>
          </Flex.Rows>
          <Flex.Rows align='right' self='center'>
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
              <Text
                icon='check'
                padding
                middle
                center
                color={colors.white}
                button
              />
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
        onPressRight={navigation.getParam('onPressRight')}
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
    this.props.navigation.setParams({
      onPressRight: this.onSubmit,
    })

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

  onSubmit = async () => {
    try {
      const { contactsID } = this.state
      await mutations.conversationCreate.commit({ contactsID })
      this.props.navigation.goBack(null)
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
