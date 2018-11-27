import { Platform, View } from 'react-native'
import React, { PureComponent } from 'react'

import { Pagination, RelayContext } from '../../../relay'
import { Text, Flex, Screen, Header, Icon } from '../../Library'
import { colors } from '../../../constants'
import { fragments } from '../../../graphql'
import { merge } from '../../../helpers'
import { shadow } from '../../../styles'
import { conversation as utils } from '../../../utils'

const Message = fragments.Event(props => {
  const conversation = props.navigation.getParam('conversation')
  const contactId = props.data.senderId
  const isMyself =
    conversation.members.find(m => m.contactId === contactId).contact.status ===
    42
  return (
    <Flex.Rows
      align={isMyself ? 'end' : 'start'}
      style={{ marginHorizontal: 10, marginVertical: 10 }}
    >
      <Text
        padding={{
          vertical: 6,
          horizontal: 10,
        }}
        multiline
        left={!isMyself}
        right={isMyself}
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
      <Text
        left={!isMyself}
        right={isMyself}
        tiny
        color={colors.subtleGrey}
        margin={{
          top: 6,
          bottom: 6,
          [isMyself ? 'left' : 'right']: 42,
        }}
      >
        {new Date(props.data.createdAt).toTimeString()}
        {' '}
        {isMyself
          ? <Icon name={props.data.ackedAt ? 'check-circle' : 'circle'} />
          : null}
      </Text>
    </Flex.Rows>
  )
})

class Input extends PureComponent {
  static contextType = RelayContext

  state = {
    input: '',
    height: 16,
  }

  onSubmit = () => {
    const { input } = this.state
    this.setState({ input: '' }, async () => {
      try {
        const conversation = this.props.navigation.getParam('conversation')
        await this.props.screenProps.context.mutations.conversationAddMessage({
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

  render () {
    return (
      <Flex.Cols style={[shadow]} justify='center' align='center'>
        <Flex.Cols
          style={{
            backgroundColor: colors.grey8,
            marginLeft: 16,
            borderRadius: 16,
          }}
        >
          <Text
            left
            middle
            margin={{
              left: 8,
              right: Platform.OS === 'web' ? 8 : 0,
              top: this.state.height > 20 ? 0 : 8,
              bottom: this.state.height > 20 ? 0 : 8,
            }}
            lineHeight={this.state.height > 20 ? 0 : 16}
            background={colors.grey8}
            icon='edit-2'
            height={this.state.height}
            input={{
              onChangeText: input => {
                this.setState({ input })
              },
              onContentSizeChange: ({
                nativeEvent: {
                  contentSize: { height },
                },
              }) => {
                this.setState({
                  height: height > 80 ? 80 : height,
                })
              },
              placeholder: 'Write a secure message...',
              autoFocus: true,
              value: this.state.input,
            }}
            multiline
            color={colors.grey5}
          />
        </Flex.Cols>
        <Text
          right
          size={0}
          middle
          margin
          height={this.state.height}
          icon='send'
          color={colors.grey5}
          onPress={this.onSubmit}
        />
      </Flex.Cols>
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
    const {
      navigation,
      screenProps: {
        context: { queries, subscriptions },
      },
    } = this.props

    return (
      <Screen style={{ backgroundColor: colors.white, paddingTop: 0 }}>
        <Pagination
          direction='forward'
          query={queries.EventList.graphql}
          variables={merge([
            queries.EventList.defaultVariables,
            {
              filter: {
                kind: 302,
                conversationId: conversation.id,
              },
            },
          ])}
          subscriptions={[subscriptions.conversationNewMessage]}
          fragment={fragments.EventList}
          alias='EventList'
          renderItem={props => <Message {...props} navigation={navigation} />}
          inverted
          style={{ paddingTop: 48 }}
        />
        <View
          style={{
            left: 0,
            right: 0,
            bottom: 0,
            position: 'absolute',
            backgroundColor: colors.white,
          }}
        >
          <Input
            navigation={this.props.navigation}
            screenProps={this.props.screenProps}
          />
        </View>
      </Screen>
    )
  }
}
