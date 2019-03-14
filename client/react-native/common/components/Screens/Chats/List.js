import React, { PureComponent } from 'react'
import { View, Platform } from 'react-native'
import {
  Avatar,
  EmptyList,
  Flex,
  Header,
  Screen,
  Text,
  Badge,
} from '../../Library'
import { Pagination } from '../../../relay'
import { borderBottom, marginLeft, padding } from '../../../styles'
import { colors } from '../../../constants'
import { fragments, enums } from '../../../graphql'
import { conversation as utils } from '../../../utils'
import withRelayContext from '../../../helpers/withRelayContext'
import { withNamespaces } from 'react-i18next'
import I18n from 'i18next'
import { hook } from 'cavy'
/* global __DEV__ */

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
      const { data, navigation, t } = this.props
      const { connected } = this.state
      const { readAt } = data
      const isRead = new Date(readAt).getTime() > 0

      // fix when contact request is send after conversation invite
      if (
        data.members.length === 2 &&
        data.members.some(
          m => m.contact == null || (m.contact.displayName === '' && m.contact.overrideDisplayName === '')
        )
      ) {
        return null
      }
      return (
        <Flex.Cols
          align='center'
          onPress={() => navigation.navigate({ routeName: 'chats/detail', params: data })}
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
            <Text color={colors.fakeBlack} left middle bold={!isRead}>
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
              <Text color={colors.subtleGrey} tiny bold={!isRead}>
                {data.infos || t('chats.new-conversation')}
              </Text>
            </Flex.Cols>
          </Flex.Rows>
        </Flex.Cols>
      )
    }
  }
)

const Item = withNamespaces()(ItemBase)

class ListScreen extends PureComponent {
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
        onPressRightBtn={() => ListScreen.onPress(navigation)}
      />
    ),
    tabBarVisible: true,
  })

  static onPress = navigation => {
    navigation.navigate('chats/add')
  }

  render () {
    const {
      navigation,
      context,
      context: { queries, fragments, subscriptions },
    } = this.props
    return (
      <Screen style={[{ backgroundColor: colors.white }]}>
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
      </Screen>
    )
  }
}

export default hook(withRelayContext(ListScreen))
