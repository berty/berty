import React, { PureComponent } from 'react'
import { FlatList } from 'react-native'
import { colors } from '../../../constants'
import { queries, mutations, subscriptions } from '../../../graphql'
import { QueryReducer } from '../../../relay'
import { Text, Flex, Screen, Header } from '../../Library'
import { paddingHorizontal, shadow } from '../../../styles'
import { conversation as utils } from '../../../utils'

const Message = props => {
  const conversation = props.navigation.getParam('conversation')
  const contactId = props.data.senderId
  const isMyself =
    conversation.members.find(m => m.contactId === contactId).contact.status ===
    42
  return (
    <Text
      padding={{
        horizontal: 10,
        vertical: 6,
      }}
      left={!isMyself}
      right={isMyself}
      self={isMyself ? 'end' : 'start'}
      background={colors.blue}
      color={colors.white}
      rounded={14.5}
      margin={{
        bottom: 16,
        [isMyself ? 'left' : 'right']: 42,
      }}
    >
      {
        JSON.parse(String.fromCharCode.apply(null, props.data.attributes))
          .message.text
      }
    </Text>
  )
}

class List extends PureComponent {
  onEndReached = () => {}

  componentDidMount () {
    const { id } = this.props.navigation.getParam('conversation')
    this.subscriber = subscriptions.conversationNewMessage.subscribe({
      updater: (store, data) => {
        if (data.conversationId === id) {
          this.props.retry && this.props.retry()
        }
      },
    })
  }

  componentWillUnmount () {
    this.subscriber.unsubscribe()
  }

  render () {
    const { data, loading } = this.props
    return (
      <FlatList
        ref={ref => (this.ref = ref)}
        style={[{ paddingTop: 54 }, paddingHorizontal]}
        data={(data.EventList || [])
          .filter(event => event.kind === 302) // CONVERSATION_NEW_MESSAGE
          .reverse()}
        inverted
        refreshing={loading}
        onEndReached={this.onEndReached}
        renderItem={data => (
          <Message
            key={data.item.id}
            data={data.item}
            separators={data.separators}
            navigation={this.props.navigation}
          />
        )}
      />
    )
  }
}

class Input extends PureComponent {
  state = {
    input: '',
  }

  onSubmit = () => {
    const { input } = this.state
    this.setState({ input: '' }, async () => {
      try {
        const conversation = this.props.navigation.getParam('conversation')
        await mutations.conversationAddMessage.commit({
          conversation: {
            id: conversation.id,
            title: '',
            topic: '',
          },
          message: {
            text: input,
          },
        })
        this.props.retry && this.props.retry()
      } catch (err) {
        console.error(err)
      }
    })
  }

  render () {
    return (
      <Text
        left
        middle
        padding
        margin
        height={36}
        rounded='circle'
        icon='edit-2'
        input={{
          returnKeyType: 'send',
          onChangeText: input => this.setState({ input }),
          placeholder: 'Write a secure message...',
          autoFocus: true,
          value: this.state.input,
        }}
        background={colors.grey8}
        color={colors.grey5}
        onSubmit={this.onSubmit}
      />
    )
  }
}

export default class Detail extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header
        navigation={navigation}
        title={utils.getTitle(navigation.getParam('conversation'))}
        backBtn
        rightBtnIcon='settings'
        onPressRightBtn={() =>
          navigation.push('chats/settings', {
            conversation: navigation.getParam('conversation'),
          })
        }
      />
    ),
  })

  render () {
    const conversation = this.props.navigation.getParam('conversation')
    return (
      <Screen style={{ backgroundColor: colors.white }}>
        <QueryReducer
          query={queries.EventList}
          variables={{
            limit: 0,
            filter: {
              id: '',
              conversationId: conversation.id,
              senderId: '',
              receiverId: '',
              ackedAt: '',
              sentAt: '',
              senderApiVersion: '',
              receiverApiVersion: '',
            },
          }}
        >
          {(state, retry) => (
            <Flex.Rows style={{ backgroundColor: colors.white }}>
              <List
                navigation={this.props.navigation}
                data={state.data}
                loading={state.type === state.loading}
                retry={retry}
              />
              <Flex.Rows
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  backgroundColor: colors.white,
                  height: 54,
                }}
              >
                <Flex.Cols
                  style={[{ height: 54 }, shadow]}
                  justify='center'
                  align='center'
                >
                  <Input navigation={this.props.navigation} retry={retry} />
                </Flex.Cols>
              </Flex.Rows>
            </Flex.Rows>
          )}
        </QueryReducer>
      </Screen>
    )
  }
}
