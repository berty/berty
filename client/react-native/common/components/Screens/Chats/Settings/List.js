import { withNamespaces } from 'react-i18next'
import I18n from 'i18next'
import React, { PureComponent } from 'react'

import { RelayContext } from '../../../../relay'
import { Screen, Menu, Header, Badge, Avatar } from '../../../Library'
import { choosePicture } from '../../../../helpers/react-native-image-picker'
import { colors } from '../../../../constants'
import { conversation as utils } from '../../../../utils'
import withRelayContext from '../../../../helpers/withRelayContext'
import { withGoBack } from '../../../Library/BackActionProvider'
import * as dateFns from '../../../../i18n/dateFns'

class ListBase extends PureComponent {
  constructor (props) {
    super(props)
    const conversation = props.navigation.getParam('conversation')
    const title = utils.getTitle(conversation)

    this.state = {
      edit: false,
      topic: conversation.topic,
      title,
      conversation,
    }
  }

  componentDidMount () {
    this.props.navigation.setParams({
      onEdit: this.onEdit,
      onSave: this.onSave,
    })
  }

  onEdit = () => {
    this.setState({ edit: true }, () =>
      this.props.navigation.setParams({ state: this.state })
    )
  }

  onSave = () => {
    const { title, topic, conversation } = this.state
    const {
      context: { mutations },
    } = this.props

    mutations.conversationUpdate({
      ...conversation,
      title,
      topic,
    })

    this.setState({ edit: false }, () =>
      this.props.navigation.setParams({ state: this.state })
    )
  }

  onChoosePicture = async event =>
    this.setState({ ...this.state, ...(await choosePicture(event)) })

  addMembers = async ({ contactsID }) => {
    try {
      const { id } = this.props.navigation.getParam('conversation')
      await this.props.context.mutations.conversationInvite({
        conversationID: id,
        contactsID,
      })
    } catch (err) {
      console.error(err)
    }
    this.props.goBack(null)
  }

  onDeleteConversation = async () => {
    const conversation = this.props.navigation.getParam('conversation')
    const { id } = conversation
    try {
      await this.context.mutations.conversationRemove({ id })
      this.props.navigation.popToTop()
    } catch (err) {
      console.error(err)
    }
  }

  render () {
    const { navigation, t, context } = this.props
    const { edit, conversation, title, topic } = this.state

    this.context = context
    return (
      <Screen>
        <Menu absolute>
          <Menu.Header
            icon={
              <Badge
                background={colors.blue}
                icon={edit && 'camera'}
                medium
                onPress={this.onChoosePicture}
              >
                <Avatar data={conversation} uri={this.state.uri} size={78} />
              </Badge>
            }
            title={!edit && title}
            description={
              !edit && dateFns.startedAgo(new Date(conversation.createdAt))
            }
          />
          {edit && (
            <Menu.Section title={t('chats.name')}>
              <Menu.Input
                value={title}
                onChangeText={title => this.setState({ title })}
              />
            </Menu.Section>
          )}
          {edit && (
            <Menu.Section title={t('chats.topic')}>
              <Menu.Input
                value={topic}
                onChangeText={topic => this.setState({ topic })}
              />
            </Menu.Section>
          )}
          {!edit && (
            <Menu.Section>
              <Menu.Item
                icon='bell'
                title={t('chats.notifications')}
                onPress={() =>
                  navigation.navigate('chats/settings/notifications')
                }
              />
              <Menu.Item
                icon='clock'
                title={t('chats.message-retention')}
                onPress={() => console.log('Message retention')}
              />
            </Menu.Section>
          )}
          {conversation.members.length <= 2 ? (
            <Menu.Section>
              <Menu.Item
                icon='user'
                title={t('contacts.details')}
                onPress={() => console.log('Contact details')}
              />
            </Menu.Section>
          ) : (
            <Menu.Section title={`${conversation.members.length} members`}>
              <Menu.Item
                icon='user-plus'
                title={t('chats.add-members')}
                color={colors.blue}
                onPress={() =>
                  this.props.navigation.navigate('chats/add', {
                    onSubmit: this.addMembers,
                  })
                }
              />
              <Menu.Item
                icon='link'
                title={t('chats.link-invite')}
                color={colors.blue}
                onPress={() => console.log('Invite to group with a link')}
              />
              {conversation.members.map(member => {
                const { id, contact, contactId } = member
                const { displayName, overrideDisplayName } = contact || {
                  displayName: '?????',
                }
                return (
                  <Menu.Item
                    key={id}
                    icon={<Avatar data={{ id: contactId }} size={28} />}
                    title={overrideDisplayName || displayName}
                  />
                )
              })}
            </Menu.Section>
          )}
          <Menu.Section>
            <Menu.Item
              icon='trash-2'
              title={t('chats.delete')}
              color={colors.error}
              onPress={this.onDeleteConversation}
            />
          </Menu.Section>
        </Menu>
      </Screen>
    )
  }
}

const List = withGoBack(withRelayContext(withNamespaces()(ListBase)))

List.contextType = RelayContext

List.navigationOptions = ({ navigation }) => {
  const [conversation, { edit }, onEdit, onSave] = [
    navigation.getParam('conversation') || { members: [] },
    navigation.getParam('state') || {},
    navigation.getParam('onEdit'),
    navigation.getParam('onSave'),
  ]
  const rightIcon = edit ? 'save' : 'edit-2'
  const onPressRight = edit ? onSave : onEdit
  return {
    tabBarVisible: false,
    header: (
      <Header
        navigation={navigation}
        title={I18n.t('chats.details')}
        rightBtnIcon={conversation.members.length > 2 && rightIcon}
        backBtn
        onPressRightBtn={conversation.members.length > 2 && onPressRight}
      />
    ),
  }
}

export default List
