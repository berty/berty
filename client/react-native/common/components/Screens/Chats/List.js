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
import { queries } from '../../../graphql'

const Header = ({ navigation }) => (
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

const Item = ({ data, navigation }) => {
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

export default class List extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: <Header navigation={navigation} />,
    tabBarVisible: true,
  })

  render () {
    const { navigation } = this.props
    return (
      <Screen style={[{ backgroundColor: colors.white }]}>
        <QueryReducer query={queries.ConversationList}>
          {(state, retry) => (
            <FlatList
              data={state.data.ConversationList || []}
              style={[paddingLeft, paddingRight]}
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
