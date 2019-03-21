import {
  ActivityIndicator,
  Platform, StyleSheet,
  TextInput as RNTextInput,
  View,
} from 'react-native'
import { btoa } from 'b64-lite'
import { withNamespaces } from 'react-i18next'
import React, { PureComponent } from 'react'

import { Flex, Header, Icon, Screen, Text, Avatar, Markdown } from '../../Library'
import { Pagination, QueryReducer, RelayContext } from '../../../relay'
import { colors } from '../../../constants'
import { fragments } from '../../../graphql'
import { merge } from '../../../helpers'
import { parseEmbedded } from '../../../helpers/json'
import { shadow } from '../../../styles'
import { conversation as utils } from '../../../utils'
import * as dateFns from '../../../i18n/dateFns'
import withRelayContext from '../../../helpers/withRelayContext'
import * as KeyboardContext from '../../../helpers/KeyboardContext'

const textStyles = StyleSheet.flatten([Markdown.styles, {
  text: {
    color: colors.white,
    ...(Platform.OS === 'web' ? {
      wordBreak: 'break-all',
      overflowWrap: 'break-word',
    } : {}),
  },
  listUnorderedItemIcon: {
    color: colors.white,
  },
  listOrderedItemIcon: {
    color: colors.white,
  },
  blocklink: {
    borderColor: colors.white,
  },
  u: {
    borderColor: colors.white,
  },
}])

class Message extends React.Component {
  static contextType = RelayContext

  messageSeen = () => {
    this.props.context.mutations.eventSeen({
      id: this.props.data.id,
    })
  }

  shouldComponentUpdate (nextProps, nextState) {
    const { data: { seenAt } } = this.props
    if (seenAt !== nextProps.data.seenAt) {
      return false
    }
    return true
  }

  render () {
    const { conversation, data, t } = this.props

    const contactId = btoa(`contact:${data.senderId}`)
    const contact = (
      conversation.members.find(m => m.contact && m.contact.id === contactId) ||
      {}
    ).contact

    const contactName = contact ? contact.displayName : t('contacts.unknown')
    const isMyself = contact && contact.status === 42
    const isOneToOne = conversation.members.length <= 2

    // TODO: implement message seen
    if (this.props.data.seenAt === null) {
      this.messageSeen()
    }
    return (
      <Flex.Rows
        align={isMyself ? 'end' : 'start'}
        style={{ marginHorizontal: 10, marginVertical: 2 }}
      >
        {!isMyself && !isOneToOne ? (
          <Flex.Cols
            style={{
              marginRight: 42,
              zIndex: 2,
            }}
          >
            <Avatar
              size={22}
              data={contact}
              style={{ margin: 0, marginBottom: -4, marginRight: 4 }}
            />
            <Text tiny color={colors.fakeBlack} padding={{ top: 6 }}>
              {contactName}
            </Text>
          </Flex.Cols>
        ) : null}

        <View
          style={{
            [isMyself ? 'marginLeft' : 'marginRight']: 42,
            [!isMyself ? 'marginLeft' : 'marginRight']: 12,
            marginTop: 2,
            marginBottom: 2,
            backgroundColor: colors.blue,
            padding: 10,
            borderTopLeftRadius: isMyself ? 14.5 : 3,
            borderTopRightRadius: 14.5,
            borderBottomLeftRadius: 14.5,
            borderBottomRightRadius: isMyself ? 3 : 14.5,
          }}
        >
          <Markdown style={textStyles}>{parseEmbedded(data.attributes).message.text}</Markdown>
        </View>
        <Text
          left={!isMyself}
          right={isMyself}
          tiny
          color={colors.subtleGrey}
          margin={{
            top: 0,
            bottom: 6,
            [isMyself ? 'left' : 'right']: 42,
          }}
        >
          {dateFns.fuzzyTimeOrFull(new Date(data.createdAt))}{' '}
          {isMyself ? (
            <Icon
              name={
                new Date(data.ackedAt).getTime() > 0 ? 'check-circle' : 'circle'
              }
              size={10}
            />
          ) : null}{' '}
        </Text>
      </Flex.Rows>
    )
  }
}

const MessageContainer = fragments.Event(withNamespaces()(Message))

class TextInputBase extends PureComponent {
  state = {
    height: 16,
    value: '',
    submitting: false,
  }

  onContentSizeChange = ({
    nativeEvent: {
      contentSize: { height },
    },
  }) => this.setState({ height: height > 80 ? 80 : height })

  render () {
    const { height } = this.state
    const { value, t } = this.props
    return (
      <KeyboardContext.Consumer>{({ keyboardVisible }) =>
        <RNTextInput
          style={[
            {
              flex: 1,
              padding: 0,
              marginVertical: 8,
              marginHorizontal: 0,
              height: height,
              color: colors.fakeBlack,
              backgroundColor: colors.inputGrey,
            },
            Platform.OS === 'web' ? { paddingLeft: 16 } : {},
          ]}
          onKeyPress={(e) => {
            if (!keyboardVisible && !e.shiftKey && e.nativeEvent.key === 'Enter') {
              this.props.onSubmit()
            }
          }}
          onContentSizeChange={this.onContentSizeChange}
          autoFocus
          placeholder={t('chats.write-message')}
          placeholderTextColor={colors.lightGrey}
          onChangeText={this.props.onChangeText}
          value={value}
          multiline
        />
      }</KeyboardContext.Consumer>
    )
  }
}

const TextInput = withNamespaces()(TextInputBase)

class Input extends PureComponent {
  static contextType = RelayContext

  state = {
    input: '',
  }

  onSubmit = () => {
    const { input } = this.state
    this.setState({ submitting: true })
    this.setState({ input: '' }, async () => {
      try {
        const conversation = this.props.navigation.state.params || {}
        input &&
          (await this.props.context.mutations.conversationAddMessage(
            {
              conversation: {
                id: conversation.id,
              },
              message: {
                text: input,
              },
            }
          ))
      } catch (err) {
        console.error(err)
      }
      this.setState({ submitting: false })
    })
  }

  onChangeText = value => {
    if (this.state.submitting || value === '\n') {
      return
    }

    this.setState({ input: value })
  }
  render () {
    return (
      <Flex.Cols
        size={0}
        justify='center'
        align='center'
        style={
          Platform.OS === 'web'
            ? [{ borderTopWidth: 0.5, borderTopColor: colors.borderGrey, position: 'absolute', bottom: 0, left: 0, right: 0 }, shadow]
            : [shadow]
        }
      >
        <Flex.Cols
          style={{
            backgroundColor: colors.grey8,
            marginLeft: 8,
            marginRight: 3,
            borderRadius: 16,
            marginVertical: 8,
          }}
        >
          <Text
            left
            top
            size={0}
            icon='edit-2'
            padding={{ right: 5, left: 8, vertical: 7 }}
          />
          <TextInput
            onChangeText={this.onChangeText}
            onSubmit={this.onSubmit}
            value={this.state.input}
          />
        </Flex.Cols>
        <Text
          right
          size={0}
          middle
          margin={{ right: 8, ...(Platform.OS === 'web' ? { left: 12 } : {}) }}
          padding
          large
          icon='send'
          color={colors.grey5}
          onPress={this.onSubmit}
        />
      </Flex.Cols>
    )
  }
}

const Chat = fragments.Conversation(
  class Chat extends PureComponent {
    render () {
      const {
        data,
        navigation,
        context: { queries, subscriptions, fragments },
        context,
      } = this.props
      return (
        <Flex.Rows>
          <Pagination
            style={[
              { flex: 1 },
              Platform.OS === 'web' ? { paddingTop: 48 } : {},
            ]}
            direction='forward'
            query={queries.EventList.graphql}
            variables={merge([
              queries.EventList.defaultVariables,
              {
                filter: {
                  kind: 302,
                  conversationId: data.id,
                },
              },
            ])}
            subscriptions={[subscriptions.message]}
            fragment={fragments.EventList}
            alias='EventList'
            renderItem={props => (
              <MessageContainer
                {...props}
                navigation={navigation}
                context={context}
                conversation={data}
              />
            )}
            inverted
          />
          <Input
            navigation={this.props.navigation}
            context={this.props.context}
          />
        </Flex.Rows>
      )
    }
  }
)
class Detail extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header
        navigation={navigation}
        title={(
          <View style={{ flexDirection: 'column' }}>
            <Text
              large
              color={colors.fakeBlack}
              justify={navigation.getParam('backBtn') ? 'center' : 'start'}
              middle
              size={5}
            >
              {utils.getTitle(navigation.state.params) || {}}
            </Text>
            {navigation.state.params.topic
              ? (
                <Text
                  justify={navigation.getParam('backBtn') ? 'center' : 'start'}
                  middle
                >
                  {navigation.state.params.topic}
                </Text>
              ) : null
            }
          </View>
        )}
        rightBtnIcon='more-vertical'
        onPressRightBtn={() =>
          navigation.navigate('chats/settings', {
            conversation: navigation.state.params,
          })
        }
        backBtn={() => {
          const backBtn = navigation.getParam('backBtn')
          if (backBtn) {
            backBtn()
          }
        }}
      />
    ),
  })

  async componentDidMount () {
    this.props.navigation.setParams({ backBtn: this.onConversationRead })
    this.onConversationRead()
  }

  onConversationRead = async () => {
    const res = await this.props.context.mutations.conversationRead(
      {
        id: this.props.navigation.getParam('id'),
      }
    )

    this.props.navigation.setParams(res.ConversationRead)
  }

  render () {
    const id = this.props.navigation.getParam('id')
    const {
      navigation,
      context,
      context: { queries },
    } = this.props
    return (
      <Screen style={{ backgroundColor: colors.white, paddingTop: 0 }}>
        <QueryReducer
          query={queries.Conversation.graphql}
          variables={merge([queries.Conversation.defaultVariables, { id: id }])}
        >
          {(state, retry) => {
            switch (state.type) {
              default:
              case state.loading:
                return (
                  <Flex.Rows align='center'>
                    <Flex.Cols align='center'>
                      <ActivityIndicator size='large' />
                    </Flex.Cols>
                  </Flex.Rows>
                )
              case state.success:
                return (
                  <Chat
                    navigation={navigation}
                    context={context}
                    data={state.data.Conversation}
                  />
                )
              case state.error:
                setTimeout(() => retry(), 1000)
                return null
            }
          }}
        </QueryReducer>
      </Screen>
    )
  }
}

export default withRelayContext(Detail)
