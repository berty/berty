import { Image } from 'react-native'
import React, { PureComponent } from 'react'

import { Flex, Header, Screen, Text } from '../../Library'
import { Pagination } from '../../../relay'
import { borderBottom, marginLeft, padding } from '../../../styles'
import { colors } from '../../../constants'
import { fragments } from '../../../graphql'
import { conversation as utils } from '../../../utils'

const Item = fragments.Conversation(({ data, navigation }) => {
  const { id, updatedAt, readAt } = data
  const isInvite = new Date(updatedAt).getTime() > 0
  const isRead = new Date(readAt).getTime() > 0
  return (
    <Flex.Cols
      align='center'
      onPress={() => navigation.push('chats/detail', { conversation: data })}
      style={[{ height: 72 }, padding, borderBottom]}
    >
      <Flex.Rows size={1} align='center'>
        <Image
          style={{ width: 40, height: 40, borderRadius: 20, margin: 4 }}
          source={{
            uri: 'https://api.adorable.io/avatars/40/' + id + '.png',
          }}
        />
      </Flex.Rows>
      <Flex.Rows size={7} align='stretch' justify='center' style={[marginLeft]}>
        <Text color={colors.black} left middle bold={!isRead}>
          {utils.getTitle(data)}
        </Text>
        <Text color={colors.subtleGrey} tiny middle left bold={!isRead}>
          {isRead
            ? 'No new message'
            : isInvite
              ? 'New conversation'
              : 'You have a new message'}
        </Text>
      </Flex.Rows>
    </Flex.Cols>
  )
})

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
    const {
      navigation,
      screenProps: {
        context: { queries, fragments, subscriptions },
      },
    } = this.props
    return (
      <Screen style={[{ backgroundColor: colors.white }]}>
        <Pagination
          direction='forward'
          query={queries.ConversationList.graphql}
          variables={queries.ConversationList.defaultVariables}
          fragment={fragments.ConversationList}
          alias='ConversationList'
          subscriptions={[subscriptions.conversationInvite]}
          renderItem={props => <Item {...props} navigation={navigation} />}
        />
      </Screen>
    )
  }
}
