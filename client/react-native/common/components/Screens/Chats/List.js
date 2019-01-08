import React, { PureComponent } from 'react'

import { Flex, Header, Screen, Text, Avatar, EmptyList } from '../../Library'
import { Pagination } from '../../../relay'
import { borderBottom, marginLeft, padding } from '../../../styles'
import { colors } from '../../../constants'
import { fragments } from '../../../graphql'
import { conversation as utils } from '../../../utils'
import { withNamespaces } from 'react-i18next'
import I18n from 'i18next'

const ItemBase = fragments.Conversation(({ data, navigation, t }) => {
  const { updatedAt, readAt } = data
  const isRead = new Date(readAt).getTime() > 0
  const isInvite = !isRead && new Date(updatedAt).getTime() <= 0
  // fix when contact request is send after conversation invite
  if (
    data.members.length === 2 &&
    data.members.some(m => m.contact == null || m.contact.displayName === '')
  ) {
    return null
  }
  return (
    <Flex.Cols
      align='center'
      onPress={() =>
        navigation.navigate('chats/detail', { conversation: data })
      }
      style={[{ height: 72 }, padding, borderBottom]}
    >
      <Flex.Rows size={1} align='center'>
        <Avatar data={data} size={40} />
      </Flex.Rows>
      <Flex.Rows size={7} align='stretch' justify='center' style={[marginLeft]}>
        <Text color={colors.black} left middle bold={!isRead}>
          {utils.getTitle(data)}
        </Text>
        <Text color={colors.subtleGrey} tiny middle left bold={!isRead}>
          {isRead
            ? t('chats.no-new-messages')
            : isInvite
              ? t('chats.new-conversation')
              : t('chats.new-message')}
        </Text>
      </Flex.Rows>
    </Flex.Cols>
  )
})

const Item = withNamespaces()(ItemBase)

export default class ListScreen extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header
        navigation={navigation}
        title={I18n.t('chats.title')}
        titleIcon='message-circle'
        rightBtnIcon='edit'
        searchBar
        searchHandler={navigation.getParam('searchHandler')} // Placeholder
        onPressRightBtn={() =>
          ListScreen.onPress(navigation)
        }
      />
    ),
    tabBarVisible: true,
  })

  static onPress = (navigation) => {
    navigation.navigate('chats/add', {
      goBack: () => {
        navigation.goBack(null)
        const retry = navigation.getParam('retry')
        retry && retry()
      },
    })
  }

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
          subscriptions={[subscriptions.conversation]}
          renderItem={props => <Item {...props} navigation={navigation} />}
          emptyItem={() => <EmptyList
            source={require('../../../static/img/emptyConversation.png')}
            text={I18n.t('chats.no-new-messages')}
            icon={'edit'}
            btnText={I18n.t('chats.new-conversation')}
            onPress={() => ListScreen.onPress(navigation)}
          />}
        />
      </Screen>
    )
  }
}
