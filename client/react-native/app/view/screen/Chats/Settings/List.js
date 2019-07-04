import { withNamespaces } from 'react-i18next'
import I18n from 'i18next'
import React, { PureComponent } from 'react'

import { Avatar, Header, Menu, Screen, Loader } from '@berty/component'
import { choosePicture } from '@berty/common/helpers/react-native-image-picker'
import { colors } from '@berty/common/constants'
import * as enums from '@berty/common/enums.gen'
import { withGoBack } from '@berty/component/BackActionProvider'
import { withStoreContext } from '@berty/store/context'
import { Store } from '@berty/container'

@withNamespaces()
@withGoBack
@withStoreContext
export class SettingsScreen extends PureComponent {
  constructor(props) {
    super(props)
    const conversation = props.navigation.getParam('conversation')
    const title = conversation.title // utils.getTitle(conversation)

    this.state = {
      edit: false,
      topic: conversation.topic,
      title,
      conversation,
    }
  }

  componentDidMount() {
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
    const { title, topic } = this.state
    const { context } = this.props

    context.node.service.conversationUpdate({
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
      const conversation = this.props.navigation.getParam('conversation')
      await this.props.context.node.service.conversationInvite({
        conversation,
        contacts: contactsID.map(id => ({
          id,
        })),
      })
      this.props.navigation.navigate('chats/detail', conversation)
    } catch (err) {
      console.error(err)
    }
  }

  onDeleteConversation = async () => {
    const { context } = this.props
    const conversation = this.props.navigation.getParam('conversation')
    const { id } = conversation
    try {
      await context.node.service.conversationRemove({ id })
      this.props.goBack()
    } catch (err) {
      console.error(err)
    }
  }

  render() {
    const conversation = this.props.navigation.getParam('conversation')
    const { edit, t, navigation } = this.props
    const { title, topic, members = [] } = conversation
    let oneToOneContact =
      conversation.kind === enums.BertyEntityConversationInputKind.OneToOne

    return (
      <Screen>
        <Menu absolute>
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
                icon="bell"
                title={t('chats.notifications')}
                onPress={() =>
                  navigation.navigate('chats/settings/notifications')
                }
              />
              <Menu.Item
                icon="clock"
                title={t('chats.message-retention')}
                onPress={() => console.log('Message retention')}
              />
            </Menu.Section>
          )}
          {oneToOneContact ? (
            <Menu.Section>
              <Menu.Item
                icon="user"
                title={t('contacts.details')}
                onPress={() => {
                  navigation.navigate('chats/contact/detail/list', {
                    id: members.find(
                      _ =>
                        _.contact.status !==
                        enums.BertyEntityContactInputStatus.Myself
                    ).contactId,
                    editRoute: 'chats/contact/detail/edit',
                  })
                }}
              />
            </Menu.Section>
          ) : (
            <Menu.Section title={`${members.length} members`}>
              <Menu.Item
                icon="user-plus"
                title={t('chats.add-members')}
                color={colors.blue}
                onPress={() =>
                  navigation.navigate('chats/settings/add-member', {
                    currentContactIds: members.map(m => m.contactId),
                    onSubmit: this.addMembers,
                  })
                }
              />
              <Menu.Item
                icon="link"
                title={t('chats.link-invite')}
                color={colors.blue}
                onPress={() => console.log('Invite to group with a link')}
              />
              {members.map(member => {
                const { id, contact, contactId } = member
                const { displayName, overrideDisplayName } = contact || {
                  id: contactId,
                  displayName: 'Unknown',
                }
                return (
                  <Menu.Item
                    key={id}
                    icon={
                      <Avatar.Contact
                        data={contact || { id: contactId }}
                        size={28}
                      />
                    }
                    title={overrideDisplayName || displayName}
                    onPress={() =>
                      navigation.navigate('modal/contacts/card', contact)
                    }
                  />
                )
              })}
            </Menu.Section>
          )}
          <Menu.Section>
            <Menu.Item
              icon="trash-2"
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

class List extends PureComponent {
  static navigationOptions = ({ navigation }) => {
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

  render() {
    const { navigation } = this.props
    const { id } = navigation.getParam('conversation')
    return (
      <Store.Entity.Conversation id={id}>
        {data =>
          data ? (
            <SettingsScreen
              navigation={navigation}
              conversation={navigation.getParam('conversation')}
            />
          ) : (
            <Loader />
          )
        }
      </Store.Entity.Conversation>
    )
  }
}

export default List
