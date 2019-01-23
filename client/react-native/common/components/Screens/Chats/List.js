import { withNamespaces } from 'react-i18next'
import I18n from 'i18next'
import React, { PureComponent } from 'react'

import { Avatar, EmptyList, Flex, Header, Screen, Text, Icon } from '../../Library'
import { BertyP2pKindInputKind } from '../../../graphql/enums.gen'
import { Pagination, QueryReducer, RelayContext } from '../../../relay'
import { borderBottom, marginLeft, padding } from '../../../styles'
import { colors } from '../../../constants'
import { fragments, enums } from '../../../graphql'
import { parseEmbedded } from '../../../helpers/json'
import { conversation as utils } from '../../../utils'
import { withNamespaces } from 'react-i18next'
import I18n from 'i18next'
import RelayContext from '../../../relay/RelayContext'

class StateBadge extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      color: colors.red,
      setint: setInterval(this.getPing, 10000),
    }

    this.getPing()
  }

  getPing = () => {
    const { other, context } = this.props
    other.contact.devices.forEach(element => {
      context.queries.GetTagInfo.fetch({ str: element.contactId })
        .then(
          (e) => {
            console.log('fetch ret', e)
            if (e.ret === true) {
              this.setState({
                color: colors.green,
              })
            }
          }
        ).catch(
          (e) => console.error('err', e)
        )
    })
  }

  render () {
    return (<Icon style={{ color: this.state.color }} name={'material-checkbox-blank-circle'} />)
  }
}


const Message = withNamespaces()(({ data, t, ...props }) => {
  switch (data.kind) {
    case BertyP2pKindInputKind.ConversationNewMessage:
      return (
        <Text color={colors.subtleGrey} {...props}>
          {parseEmbedded(data.attributes).message.text || '...'}
        </Text>
      )
    case BertyP2pKindInputKind.ConversationInvite:
      return (
        <Text color={colors.subtleGrey} {...props}>
          {t('chats.new-conversation')}
        </Text>
      )
    default:
      return (
        <Text color={colors.subtleGrey} {...props}>
          {String('chats.new-message')}
        </Text>
      )
  }
})

const LastMessageBase = ({ conversation }) => {
  const { updatedAt: refetchWhenUpdate, readAt } = conversation
  const isRead = new Date(readAt).getTime() > 0
  return (
    <RelayContext.Consumer>
      {({ queries }) => (
        <QueryReducer
          query={queries.ConversationLastEvent.graphql}
          variables={{ id: conversation.id, refetchWhenUpdate }}
        >
          {state => {
            switch (state.type) {
              default:
              case state.success:
                return (
                  <Message
                    data={state.data.ConversationLastEvent}
                    bold={!isRead}
                    tiny
                    middle
                    left
                  />
                )
              case state.loading:
              case state.error:
                return (
                  <Text
                    color={colors.subtleGrey}
                    bold={!isRead}
                    tiny
                    middle
                    left
                  >
                    ...
                  </Text>
                )
            }
          }}
        </QueryReducer>
      )}
    </RelayContext.Consumer>
  )
}
const LastMessage = withNamespaces()(LastMessageBase)

const ItemBase = fragments.Conversation(({ data, navigation, t }) => {
  const { readAt } = data
  const isRead = new Date(readAt).getTime() > 0
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
        {data.members.length === 2
          ? <RelayContext.Consumer>
            {context => <StateBadge
              other={data.members.find(element => element.contact.status !== enums.BertyEntityContactInputStatus.Myself)}
              // other={data.members}
              context={context} />}
          </RelayContext.Consumer>
          : null
        }
      </Flex.Rows>
      <Flex.Rows size={7} align='stretch' justify='center' style={[marginLeft]}>
        <Text color={colors.black} left middle bold={!isRead}>
          {utils.getTitle(data)}
        </Text>
        <LastMessage conversation={data} />
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
        onPressRightBtn={() => ListScreen.onPress(navigation)}
      />
    ),
    tabBarVisible: true,
  })

  static onPress = navigation => {
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
          emptyItem={() => (
            <EmptyList
              source={require('../../../static/img/empty-conversation.png')}
              text={I18n.t('chats.no-new-messages')}
              icon={'edit'}
              btnText={I18n.t('chats.new-conversation')}
              onPress={() => ListScreen.onPress(navigation)}
            />
          )}
        />
      </Screen>
    )
  }
}
