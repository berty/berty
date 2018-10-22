/* eslint-disable */
import { ActivityIndicator, FlatList } from 'react-native'
import React, { Fragment, PureComponent } from 'react'

import { QueryReducer } from '../../../relay'
import { Text, Flex, Screen, Header } from '../../Library'
import { colors } from '../../../constants'
import { fragments, mutations, queries, subscriptions } from '../../../graphql'
import { merge } from '../../../helpers'
import { paddingHorizontal, shadow } from '../../../styles'
import { conversation as utils } from '../../../utils'

const Message = fragments.Event(props => {
  const conversation = props.navigation.getParam('conversation')
  const contactId = props.data.senderId
  const isMyself =
    conversation.members.find(m => m.contactId === contactId).contact.status ===
    42
  return (
    <Fragment>
      <Text
        padding={{
          horizontal: 10,
          vertical: 6,
        }}
        left={!isMyself}
        right={isMyself}
        self={isMyself ? 'end' : 'start'}
        tiny
        color={colors.subtleGrey}
        margin={{
          bottom: 16,
          [isMyself ? 'left' : 'right']: 42,
        }}
      >
        {new Date(props.data.createdAt).toTimeString()}
      </Text>
      <Text
        padding={{
          horizontal: 10,
          vertical: 6,
        }}
        multiline
        left={!isMyself}
        right={isMyself}
        self={isMyself ? 'end' : 'start'}
        background={colors.blue}
        color={colors.white}
        rounded={14.5}
        margin={{
          bottom: 4,
          [isMyself ? 'left' : 'right']: 42,
        }}
      >
        {
          JSON.parse(String.fromCharCode.apply(null, props.data.attributes))
            .message.text
        }
      </Text>
    </Fragment>
  )
})

class Input extends PureComponent {
  state = {
    input: '',
  }

  onSubmit = () => {
    const { input } = this.state
    this.setState({ input: '' }, async () => {
      try {
        const conversation = this.props.navigation.getParam('conversation')
        await mutations.conversationAddMessage({
          conversation: {
            id: conversation.id,
          },
          message: {
            text: input,
          },
        })
      } catch (err) {
        console.error(err)
      }
    })
  }

  render() {
    return (
      <Text
        left
        middle
        padding
        margin
        height={32}
        rounded={32}
        icon="edit-2"
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

const List = fragments.EventList(
  class List extends PureComponent {
    onEndReached = () => {
      if (!this.props.relay.hasMore() || this.props.relay.isLoading()) {
        return
      }
      this.props.relay.loadMore(5, console.error)
    }

    componentDidMount() {
      const conversation = this.props.navigation.getParam('conversation')
      this.subscriber = subscriptions.conversationNewMessage.subscribe(
        conversation
      )
    }

    componentWillUnmount() {
      this.subscriber.unsubscribe()
    }

    render() {
      const { data, loading } = this.props
      const edges = (data && data.EventList && data.EventList.edges) || []
      return (
        <Flex.Rows style={{ backgroundColor: colors.white }}>
          <FlatList
            ref={ref => (this.ref = ref)}
            style={[{ paddingTop: 54 }, paddingHorizontal]}
            data={edges}
            inverted
            refreshing={loading}
            onEndReached={this.onEndReached}
            renderItem={({ item: { node, cursor }, separators }) => (
              <Message
                key={cursor}
                data={node}
                separators={separators}
                navigation={this.props.navigation}
              />
            )}
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
              justify="center"
              align="center"
            >
              <Input navigation={this.props.navigation} />
            </Flex.Cols>
          </Flex.Rows>
        </Flex.Rows>
      )
    }
  }
)

export default class Detail extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header
        navigation={navigation}
        title={utils.getTitle(navigation.getParam('conversation'))}
        backBtn
        rightBtnIcon="settings"
        onPressRightBtn={() =>
          navigation.push('chats/settings', {
            conversation: navigation.getParam('conversation'),
          })
        }
      />
    ),
  })

  render() {
    const conversation = this.props.navigation.getParam('conversation')
    return (
      <Screen style={{ backgroundColor: colors.white }}>
        <QueryReducer
          query={queries.EventList}
          variables={merge([
            queries.EventList.defaultVariables,
            {
              filter: {
                kind: 302,
                conversationId: conversation.id,
              },
            },
          ])}
        >
          {(state, retry) => {
            switch (state.type) {
              default:
              case state.loading:
                return <ActivityIndicator size="large" />
              case state.success:
                return (
                  <List
                    navigation={this.props.navigation}
                    data={state.data}
                    loading={state.type === state.loading}
                  />
                )
              case state.error:
                return null
            }
          }}
        </QueryReducer>
      </Screen>
    )
  }
}
