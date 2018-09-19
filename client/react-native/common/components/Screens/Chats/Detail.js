import React, { PureComponent } from 'react'
import { TouchableOpacity, FlatList } from 'react-native'
import { colors } from '../../../constants'
import { queries, mutations, subscriptions } from '../../../graphql'
import { QueryReducer } from '../../../relay'
import { Text, Flex, Screen } from '../../Library'

const Message = props => (
  <Text
    left
    margin={8}
    padding={16}
    color={colors.white}
    rounded={12}
    background={colors.grey1}
  >
    {atob(props.data.attributes).trim()}
  </Text>
)

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
    const { data, loading, retry } = this.props
    return (
      <FlatList
        style={{ paddingBottom: 60 }}
        data={(data.EventList || []).filter(
          event => event.kind === 'ConversationNewMessage'
        )}
        refreshing={loading}
        onRefresh={retry}
        renderItem={data => (
          <Message
            key={data.item.id}
            data={data.item}
            separators={data.separators}
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

  onSubmit = async retry => {
    try {
      const conversation = this.props.navigation.getParam('conversation')
      const { input } = this.state
      await mutations.conversationAddMessage.commit({
        conversationID: conversation.id,
        message: input,
      })
      this.props.retry && this.props.retry()
    } catch (err) {
      console.error(err)
    }
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
    headerTitle: (
      <Text large>{getTitle(navigation.getParam('conversation'))}</Text>
    ),
    headerLeft: (
      <TouchableOpacity onPress={() => navigation.goBack(null)}>
        <Text padding large icon='arrow-left' />
      </TouchableOpacity>
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
            <Flex.Rows>
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
                  height: 60,
                }}
              >
                <Flex.Cols style={{ height: 60 }} space='center'>
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
