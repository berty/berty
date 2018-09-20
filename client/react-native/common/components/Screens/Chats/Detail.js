import React, { PureComponent } from 'react'
import { FlatList, Text as TextNative } from 'react-native'
import { colors } from '../../../constants'
import { queries, mutations, subscriptions } from '../../../graphql'
import { QueryReducer } from '../../../relay'
import { Text, Flex, Screen, Header } from '../../Library'
import { paddingHorizontal, shadow, textRight, textLeft } from '../../../styles'

const Message = props => {
  const conversation = props.navigation.getParam('conversation')
  const contactId = props.data.senderId
  const isMyself =
    conversation.members.find(m => m.contactId === contactId).contact.status ===
    'Myself'
  return (
    <Flex.Cols
      style={{
        marginTop: 4,
        marginBottom: 4,
        marginLeft: isMyself ? 30 : 0,
        marginRight: isMyself ? 0 : 30,
      }}
      justify={isMyself ? 'end' : 'start'}
    >
      <TextNative
        style={[
          {
            color: colors.white,
            backgroundColor: colors.blue,
            padding: 8,
            borderRadius: 12,
            flexWrap: 'wrap',
          },
          isMyself ? textRight : textLeft,
        ]}
      >
        {JSON.parse(props.data.attributes).message.text}
      </TextNative>
    </Flex.Cols>
  )
}

const getTitle = ({ title, members } = this.props) =>
  title ||
  members.map((m, index) => {
    const displayName =
      m.contact.status === 'Myself'
        ? m.contact.status
        : m.contact.overrideDisplayName || m.contact.displayName
    const before =
      index === 0 ? '' : index === members.length - 1 ? ' and ' : ', '
    return `${before}${displayName}`
  })

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
          .filter(event => event.kind === 'ConversationNewMessage')
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
          conversationID: conversation.id,
          message: input,
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
        flex
        rounded='circle'
        icon='edit-2'
        input={{
          returnKeyType: 'send',
          onChangeText: input => this.setState({ input }),
          placeholder: 'Write a secure message...',
          autoFocus: true,
          value: this.state.input,
        }}
        height={36}
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
        title={getTitle(navigation.getParam('conversation'))}
        backBtn
      />
    ),
  })

  render () {
    const conversation = this.props.navigation.getParam('conversation')
    return (
      <Screen style={{ backgroundColor: colors.white }}>
        <QueryReducer
          query={queries.EventList}
          variables={{ conversationID: conversation.id }}
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
