import {
  Avatar,
  Flex,
  Header,
  Icon,
  Markdown,
  Text,
  Loader,
  Screen,
  OptimizedFlatList,
} from '@berty/component'
import { colors } from '@berty/common/constants'
import { conversation as utils } from '@berty/common/helpers/entity'
import { shadow } from '@berty/common/styles'
import { withStoreContext } from '@berty/store/context'
import { Store } from '@berty/container'
import * as KeyboardContext from '@berty/common/helpers/KeyboardContext'
import React, { Component, PureComponent } from 'react'
import * as dateFns from '@berty/common/locale/dateFns'
import * as enums from '@berty/common/enums.gen'
import tDate from '@berty/common/helpers/timestampDate'
import BertyEntityMessage from '@berty/bridge/service/entity/message'

import {
  Platform,
  TextInput as RNTextInput,
  StyleSheet,
  View,
} from 'react-native'
import { withNamespaces } from 'react-i18next'
import ActionSheet from 'react-native-actionsheet'

const textStyles = StyleSheet.flatten([
  Markdown.styles,
  {
    text: {
      color: colors.white,
      ...(Platform.OS === 'web'
        ? {
            wordBreak: 'break-all',
            overflowWrap: 'break-word',
          }
        : {}),
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
  },
])

@withNamespaces()
export class Message extends PureComponent {
  messageSeen = () => {
    // this.props.context.node.service.eventSeen({
    //   id: this.props.data.id,
    // })
  }

  messageRetry = () => {
    this.props.context.node.service.eventRetry({
      id: this.props.data.id,
    })
  }

  render() {
    const { conversation, data, t } = this.props

    const contactId = data.sourceDeviceId
    const { contact } =
      conversation.members.find(m => m.contact && m.contact.id === contactId) ||
      {}

    const contactName = contact ? contact.displayName : t('contacts.unknown')
    const isMyself = contact && contact.status === 42
    const isOneToOne =
      conversation.kind === enums.BertyEntityConversationInputKind.OneToOne
    // TODO: implement message seen
    if (tDate(data.seenAt).getTime() <= 0) {
      this.messageSeen()
    }

    let iconColor = null
    let iconName = utils.isReadByOthers(data) ? 'check-circle' : 'circle'
    let failed = utils.messageHasError(data)
    if (failed) {
      iconName = 'x-circle'
      iconColor = 'red'
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
          <Markdown style={textStyles}>
            {BertyEntityMessage.decode(data.attributes).text}
          </Markdown>
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
          {dateFns.fuzzyTimeOrFull(tDate(data.createdAt))}{' '}
          {isMyself ? (
            <Icon
              name={iconName}
              color={iconColor}
              size={10}
              onPress={
                failed
                  ? () => {
                      if (Platform.OS !== 'web') {
                        this.ActionSheet.show()
                      } else if (window.confirm('Do you want to retry?')) {
                        this.messageRetry()
                      }
                    }
                  : null
              }
            />
          ) : null}{' '}
        </Text>
        {failed && Platform.OS !== 'web' ? (
          <ActionSheet
            ref={o => {
              this.ActionSheet = o
            }}
            title={'Do you want to retry?'}
            options={['Yes', 'No']}
            cancelButtonIndex={1}
            onPress={index => index !== 1 && this.messageRetry()}
          />
        ) : null}
      </Flex.Rows>
    )
  }
}

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

  render() {
    const { height } = this.state
    const { value, t } = this.props
    return (
      <KeyboardContext.Consumer>
        {({ keyboardVisible }) => (
          <RNTextInput
            style={[
              {
                flex: 1,
                padding: 0,
                marginVertical: 8,
                marginHorizontal: 0,
                height,
                color: colors.fakeBlack,
                backgroundColor: colors.inputGrey,
              },
              Platform.OS === 'web' ? { paddingLeft: 16 } : {},
            ]}
            onKeyPress={e => {
              if (
                !keyboardVisible &&
                !e.shiftKey &&
                e.nativeEvent.key === 'Enter'
              ) {
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
        )}
      </KeyboardContext.Consumer>
    )
  }
}

const TextInput = withNamespaces()(TextInputBase)

export class Input extends PureComponent {
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
          (await this.props.context.node.service.conversationAddMessage({
            conversation: {
              id: conversation.id,
            },
            message: {
              text: input,
            },
          }))
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

  render() {
    return (
      <Flex.Cols
        size={0}
        justify="center"
        align="center"
        style={
          Platform.OS === 'web'
            ? [
                {
                  borderTopWidth: 0.5,
                  borderTopColor: colors.borderGrey,
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                },
                shadow,
              ]
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
            icon="edit-2"
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
          icon="send"
          color={colors.grey5}
          onPress={this.onSubmit}
        />
      </Flex.Cols>
    )
  }
}

export class Chat extends Component {
  getItemLayout = (data, index) => ({
    length: 65,
    offset: 65 * index,
    index,
  })

  shouldComponentUpdate(props) {
    return props.data.id !== this.props.data.id
  }

  render() {
    const { data, navigation, context } = this.props

    return (
      <Flex.Rows>
        <Store.Node.Service.EventList.Pagination
          filter={{ kind: 302, targetAddr: data.id }}
          paginate={({ cursor }) => ({
            first: 30,
            after: cursor
              ? tDate(cursor).toISOString()
              : new Date(Date.now()).toISOString(),
            orderBy: 'created_at',
            orderDesc: true,
          })}
          cursorExtractor={item => tDate(item.updatedAt).getTime() || 0}
        >
          {({ queue, count, retry, loading, paginate }) => (
            <OptimizedFlatList
              style={{ marginBottom: 50 }}
              data={queue}
              onEndReached={paginate}
              getItemLayout={this.getItemLayout}
              onRefresh={retry}
              refreshing={loading}
              renderItem={({ item }) => (
                <Message
                  data={item}
                  navigation={navigation}
                  context={context}
                  conversation={data}
                />
              )}
              inverted
            />
          )}
        </Store.Node.Service.EventList.Pagination>
        <Input
          navigation={this.props.navigation}
          context={this.props.context}
        />
      </Flex.Rows>
    )
  }
}

@withStoreContext
class ConversationDetailHeader extends PureComponent {
  render() {
    const { navigation } = this.props
    return (
      <Store.Entity.Conversation id={navigation.getParam('id')}>
        {data =>
          data ? (
            <Header
              navigation={navigation}
              title={
                <View style={{ flexDirection: 'column' }}>
                  <Text
                    large
                    color={colors.fakeBlack}
                    justify={
                      navigation.getParam('backBtn') ? 'center' : 'start'
                    }
                    ellipsis
                    middle
                    size={5}
                  >
                    {utils.getTitle(data)}
                  </Text>
                  {data.topic ? (
                    <Text
                      justify={
                        navigation.getParam('backBtn') ? 'center' : 'start'
                      }
                      middle
                    >
                      {data.topic}
                    </Text>
                  ) : null}
                </View>
              }
              rightBtnIcon="more-vertical"
              onPressRightBtn={() =>
                navigation.navigate('chats/settings', {
                  conversation: data,
                })
              }
              backBtn={() => {
                const backBtn = navigation.getParam('backBtn')
                if (backBtn) {
                  backBtn()
                }
              }}
            />
          ) : (
            <Loader />
          )
        }
      </Store.Entity.Conversation>
    )
  }
}

@withStoreContext
class ConversationDetail extends PureComponent {
  static navigationOptions = ({ navigation }) => {
    const header = navigation.getParam('header', () => null)
    return {
      header: header({ navigation }),
    }
  }

  header = ({ navigation }) => (
    <ConversationDetailHeader
      context={this.props.context}
      navigation={navigation}
    />
  )

  async componentDidMount() {
    this.props.navigation.setParams({
      backBtn: this.onConversationRead,
      header: this.header,
    })
    this.onConversationRead()
  }

  onConversationRead = async () => {
    const id = this.props.navigation.getParam('id')
    if (!id) {
      return
    }
    const res = await this.props.context.node.service.conversationRead({
      id,
    })

    this.props.navigation.setParams(res.ConversationRead)
  }

  render() {
    const { navigation, context } = this.props
    return (
      <Screen style={{ backgroundColor: colors.white, paddingTop: 0 }}>
        <Store.Entity.Conversation id={navigation.getParam('id')}>
          {data =>
            data ? (
              <Chat navigation={navigation} context={context} data={data} />
            ) : (
              <Loader />
            )
          }
        </Store.Entity.Conversation>
      </Screen>
    )
  }
}

export default ConversationDetail
