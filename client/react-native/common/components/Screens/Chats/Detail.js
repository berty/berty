import React, { PureComponent } from 'react'
import { TouchableOpacity, FlatList } from 'react-native'
import { Text, Flex, Screen } from '../../Library'
import { colors } from '../../../constants'
import { queries, mutations, subscriptions } from '../../../graphql'
import { QueryReducer } from '../../../relay'

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

  state = {
    conversation: this.props.navigation.getParam('conversation'),
    members: this.props.navigation.getParam('conversation').members,
    messages: [],
    input: '',
  }

  onSubmit = async (data, retry) => {
    try {
      const { conversation, text } = this.state
      await mutations.conversationAddMessage.commit({
        conversationID: conversation.id,
        message: text,
      })
      this.retry && this.retry()
    } catch (err) {
      console.error(err)
    }
  }

  componentDidMount () {
    const {
      conversation: { id },
    } = this.state
    this.subscriber = subscriptions.conversationNewMessage.subscribe({
      updater: (store, data) => {
        if (data.conversationId === id) {
          this.retry && this.retry()
        }
      },
    })
  }

  componentWillUnmount () {
    this.subscriber.unsubscribe()
  }

  render () {
    const {
      conversation: { id },
    } = this.state
    return (
      <Screen style={{ backgroundColor: colors.white }}>
        <Flex.Rows>
          <QueryReducer
            query={queries.EventList}
            variables={{ conversationID: id }}
          >
            {(state, retry) =>
              (this.retry = retry) && (
                <FlatList
                  style={{ paddingBottom: 60 }}
                  data={state.data.EventList.filter(
                    event => event.kind === 'ConversationNewMessage'
                  )}
                  refreshing={state.type === state.loading}
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
          </QueryReducer>
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
                  onChangeText: text => this.setState({ text }),
                  placeholder: 'Write a secure message...',
                }}
                height={36}
                background={colors.grey8}
                color={colors.grey5}
                onSubmit={this.onSubmit}
              />
            </Flex.Cols>
          </Flex.Rows>
        </Flex.Rows>
      </Screen>
    )
  }
}
