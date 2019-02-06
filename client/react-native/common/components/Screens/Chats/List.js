import React, { PureComponent } from 'react'
import { View } from 'react-native'
import {
  Avatar,
  EmptyList,
  Flex,
  Header,
  Screen,
  Text,
  Badge,
} from '../../Library'
import { BertyP2pKindInputKind } from '../../../graphql/enums.gen'
import { Pagination, QueryReducer, RelayContext } from '../../../relay'
import { borderBottom, marginLeft, padding } from '../../../styles'
import { colors } from '../../../constants'
import { fragments, enums } from '../../../graphql'
import { parseEmbedded } from '../../../helpers/json'
import { conversation as utils } from '../../../utils'
import { withNamespaces } from 'react-i18next'
import I18n from 'i18next'
import { hook } from 'cavy'

const Message = withNamespaces()(({ data, t, ...props }) => {
  switch (data.kind) {
    case BertyP2pKindInputKind.ConversationNewMessage:
      return (
        <Text color={colors.subtleGrey} {...props}>
          {parseEmbedded(data.attributes).message.text || '...'}
        </Text>
      )
    case BertyP2pKindInputKind.ContactRequest:
    case BertyP2pKindInputKind.ContactRequestAccepted:
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

const LastMessageBase = ({ conversation, context }) => {
  const { updatedAt: refetchWhenUpdate, readAt } = conversation
  const isRead = new Date(readAt).getTime() > 0
  return (
    <QueryReducer
      query={context.queries.ConversationLastEvent.graphql}
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
              <Text color={colors.subtleGrey} bold={!isRead} tiny middle left>
                ...
              </Text>
            )
        }
      }}
    </QueryReducer>
  )
}
const LastMessage = withNamespaces()(LastMessageBase)

const ItemBase = fragments.Conversation(
  class ItemBase extends React.PureComponent {
    constructor (props) {
      super(props)
      const { data } = props
      this.state = {
        connected: false,
        other:
          data.members.length === 2
            ? data.members.find(
              element =>
                element.contact.status !==
                  enums.BertyEntityContactInputStatus.Myself
            )
            : null,
        interval:
          data.members.length === 2 ? setInterval(this.getPing, 10000) : null,
      }

      if (data.members.length === 2) {
        this.getPing()
      }
    }

    componentWillUnmount () {
      if (this.state.interval !== null) {
        clearInterval(this.state.interval)
      }
    }

    getPing = () => {
      const { context } = this.props
      const { other } = this.state

      other &&
        other.contact &&
        other.contact.devices &&
        other.contact.devices.forEach(element => {
          context.queries.Libp2PPing.fetch({ str: element.contactId })
            .then(e => {
              console.log('fetch ret', e)
              this.setState({ connected: e.ret })
            })
            .catch(e => console.warn('err', e))
        })
    }

    render () {
      const { data, navigation, context } = this.props
      const { connected } = this.state
      const { readAt } = data
      const isRead = new Date(readAt).getTime() > 0
      // fix when contact request is send after conversation invite
      if (
        data.members.length === 2 &&
        data.members.some(
          m => m.contact == null || m.contact.displayName === ''
        )
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
            {data.members.length === 2 && connected ? (
              <View>
                <Badge
                  color={colors.green}
                  background={colors.white}
                  icon={'material-checkbox-blank-circle'}
                  small
                  bottom
                  getSize={() => {
                    return 18
                  }}
                >
                  <Avatar data={this.props.data} size={40} />
                </Badge>
              </View>
            ) : (
              <Avatar data={data} size={40} />
            )}
          </Flex.Rows>
          <Flex.Rows
            size={7}
            align='stretch'
            justify='center'
            style={[marginLeft]}
          >
            <Text color={colors.black} left middle bold={!isRead}>
              {utils.getTitle(data)}
            </Text>
            <Flex.Cols size={1} justify='flex-start'>
              {data.members.length === 2 && connected ? (
                <View>
                  <Text
                    margin={{ right: 4 }}
                    bold
                    color={colors.green}
                    tiny
                    middle
                    left
                  >
                    {'online'}
                  </Text>
                </View>
              ) : null}
              <LastMessage context={context} conversation={data} size={2} />
            </Flex.Cols>
          </Flex.Rows>
        </Flex.Cols>
      )
    }
  }
)

const Item = withNamespaces()(ItemBase)

class ListScreen extends PureComponent {
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
        <RelayContext.Consumer>
          {context => (
            <Pagination
              direction='forward'
              query={queries.ConversationList.graphql}
              variables={queries.ConversationList.defaultVariables}
              fragment={fragments.ConversationList}
              alias='ConversationList'
              subscriptions={[subscriptions.conversation]}
              renderItem={props => (
                <Item {...props} context={context} navigation={navigation} />
              )}
              emptyItem={() => (
                <EmptyList
                  source={require('../../../static/img/empty-conversation.png')}
                  text={I18n.t('chats.no-new-messages')}
                  icon={'edit'}
                  btnRef={this.props.generateTestHook('ChatList.NewConvButton')}
                  btnText={I18n.t('chats.new-conversation')}
                  onPress={() => ListScreen.onPress(navigation)}
                />
              )}
            />
          )}
        </RelayContext.Consumer>
      </Screen>
    )
  }
}

export default hook(ListScreen)
