import {
  Avatar,
  Flex,
  EmptyList,
  Header,
  Text,
  Badge,
  Icon,
  Loader,
  Screen,
  OptimizedFlatList,
} from '@berty/component'
import { borderBottom, marginLeft, padding } from '@berty/common/styles'
import { colors } from '@berty/common/constants'
import { merge } from '@berty/common/helpers'
import React, { PureComponent } from 'react'
import * as enums from '@berty/common/enums.gen'
import { Store } from '@berty/container'
import { View, Platform } from 'react-native'
import { hook } from 'cavy'
import { withNamespaces } from 'react-i18next'
import { withNavigation } from 'react-navigation'
import I18n from 'i18next'

/* global __DEV__ */

@withNamespaces()
@withNavigation
export class Item extends React.PureComponent {
  constructor (props) {
    super(props)
    const { data } = props
    this.state = {
      unread: [],
      connected: false,
      other:
        data.members.length === 2
          ? data.members.find(
            element =>
              element &&
                element.contact &&
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
    this.subscriber = null
  }

  componentWillUnmount () {
    if (this.state.interval !== null) {
      clearInterval(this.state.interval)
    }
    if (this.subscriber !== null) {
      this.subscriber.unsubscribe()
    }
  }

  componentDidMount () {
    const {
      context: { queries, subscriptions },
    } = this.props

    queries.EventUnseen.fetch(
      merge([
        queries.EventUnseen.defaultVariables,
        {
          filter: {
            kind: 302,
            targetAddr: this.props.data.id,
            direction: 1,
          },
          onlyWithoutSeenAt: 1,
        },
      ])
    ).then(e => {
      this.setState({
        unread: e.map(val => {
          return val.id
        }),
      })
    })

    this.subscriber = subscriptions.commitLogStream.subscribe({
      updater: this.updateBadge,
    })
  }

  updateBadge = (store, data) => {
    const [entity] = [data.CommitLogStream.entity.event]
    const {
      data: { id },
    } = this.props
    let { unread } = this.state

    if (
      entity &&
      entity.direction === 1 &&
      id === entity.conversationId &&
      entity.kind === 302
    ) {
      if (entity.seenAt === null && unread.indexOf(entity.id) === -1) {
        this.setState({
          unread: [...unread, entity.id],
        })
      } else if (entity.seenAt !== null && unread.indexOf(entity.id) !== -1) {
        unread.splice(unread.indexOf(entity.id), 1)
        this.setState({
          unread: unread,
        })
      }
    }
  }

  getPing = () => {
    // const { context } = this.props
    // const { other } = this.state
    // @FIXME: not implemented on the back
    // other &&
    //   other.contact &&
    //   other.contact.devices &&
    //   other.contact.devices.forEach(element => {
    //     context.queries.Libp2PPing.fetch({ str: element.contactId })
    //       .then(e => {
    //         console.log('fetch ret', e)
    //         this.setState({ connected: e.ret })
    //       })
    //       .catch(e => console.warn('err', e))
    //   })
  }

  render () {
    const { data, navigation, t } = this.props
    const { connected, unread } = this.state

    // @FIXME: destroyed by refactor
    const isRead = false // utils.isReadByMe(data)
    // fix when contact request is send after conversation invite
    if (
      data.members.length === 2 &&
      data.members.some(
        m =>
          m.contact == null ||
          (m.contact.displayName === '' && m.contact.overrideDisplayName === '')
      )
    ) {
      return null
    }
    return (
      <Flex.Cols
        align='center'
        onPress={() =>
          navigation.navigate({ routeName: 'chats/detail', params: data })
        }
        style={[
          {
            height: 72,
          },
          padding,
          borderBottom,
        ]}
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
          <Text color={colors.fakeBlack} left middle bold={!isRead}>
            {
              // @FIXME: destroyed by refactor
              // utils.getTitle(data)
            }
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
            <Text color={colors.subtleGrey} tiny bold={!isRead}>
              {data.infos || t('chats.new-conversation')}
            </Text>
          </Flex.Cols>
        </Flex.Rows>
        <Flex.Rows size={1} justify='flex-end' align='center'>
          <Icon.Badge
            position={'relative'}
            right={0}
            top={0}
            size={24}
            badge={unread.length > 0 ? '!' : ''}
            value={unread.length}
          />
        </Flex.Rows>
      </Flex.Cols>
    )
  }
}

@hook
class ConversationList extends PureComponent {
  constructor (props) {
    super(props)

    if (Platform.OS !== 'web' && __DEV__) {
      const DevMenu = require('react-native-dev-menu')
      DevMenu.addItem('Dev tools', () =>
        this.props.navigation.navigate('settings/devtools')
      )
    }
  }

  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header
        navigation={navigation}
        title={I18n.t('chats.title')}
        titleIcon='message-circle'
        rightBtnIcon='edit'
        onPressRightBtn={() => ConversationList.onPress(navigation)}
      />
    ),
    tabBarVisible: true,
  })

  static onPress = navigation => {
    navigation.navigate('chats/add')
  }

  static ITEM_HEIGHT = (() => {
    switch (Platform.OS) {
      case 'web':
        // eslint-disable-next-line
        return __DEV__ ? 80.5 : 72
      case 'android':
      case 'ios':
      default:
        return 72
    }
  })()

  getItemLayout = (data, index) => ({
    length: ConversationList.ITEM_HEIGHT,
    offset: ConversationList.ITEM_HEIGHT * index,
    index,
  })

  renderItem = ({ item: data, index }) => (
    <Item
      data={data}
      context={this.props.context}
      navigation={this.props.navigation}
      navigatorContext={this.props.navigatorContext}
    />
  )

  render () {
    const { navigation } = this.props
    return (
      <Screen>
        <Store.Node.Service.ConversationList.Pagination
          paginate={({ cursor }) => ({
            first: 50,
            after: cursor,
            sortedBy: 'updated_at',
          })}
          fallback={<Loader />}
        >
          {({ queue, count, retry, loading, paginate }) =>
            count ? (
              <OptimizedFlatList
                data={queue}
                onEndReached={paginate}
                getItemLayout={this.getItemLayout}
                renderItem={this.renderItem}
                onRefresh={retry}
                refreshing={loading}
              />
            ) : (
              <EmptyList
                source={require('@berty/common/static/img/empty-conversation.png')}
                text={I18n.t('chats.no-new-messages')}
                icon={'edit'}
                btnRef={this.props.generateTestHook('ChatList.NewConvButton')}
                btnText={I18n.t('chats.new-conversation')}
                onPress={() => ConversationList.onPress(navigation)}
              />
            )
          }
        </Store.Node.Service.ConversationList.Pagination>
      </Screen>
    )
  }
}

export default ConversationList
