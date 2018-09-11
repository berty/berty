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
} from '../../../styles'
import { QueryReducer } from '../../../relay'
import { queries } from '../../../graphql'

const Header = ({ navigation }) => (
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
        <Text icon='feather-users' left large color={colors.black}>
          Contacts
        </Text>
        <Text
          icon='user-plus'
          large
          right
          button
          color='black'
          onPress={() => navigation.push('Add')}
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
    header: <Header navigation={navigation} />,
    tabBarVisible: true,
  })

  sortContacts = ContactList => {
    return ContactList.sort((a, b) => {
      let an = a['displayName'].toLowerCase()
      let bn = b['displayName'].toLowerCase()
      return an < bn ? -1 : an > bn ? 1 : 0
    })
  }

  render () {
    const { navigation } = this.props
    return (
      <Screen style={[{ backgroundColor: colors.white }]}>
        <QueryReducer query={queries.ContactList}>
          {(state, retry) => (
            <FlatList
              data={this.sortContacts([].concat(state.data.ContactList || []))}
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
          )}
        </QueryReducer>
      </Screen>
    )
  }
}
