import { withNamespaces } from 'react-i18next'
import { withNavigation } from 'react-navigation'
import I18n from 'i18next'
import React, { PureComponent } from 'react'

import { Avatar, Header, Menu, Screen } from '../../../Library'
import { QueryReducer, RelayContext } from '../../../../relay'
import { choosePicture } from '../../../../helpers/react-native-image-picker'
import { colors } from '../../../../constants'
import {
  contact as contactUtils,
  conversation as utils,
} from '../../../../utils'
import { enums } from '../../../../graphql'
import { merge } from '../../../../helpers'
import { showContact } from '../../../../helpers/contacts'
import { withGoBack } from '../../../Library/BackActionProvider'
import withRelayContext from '../../../../helpers/withRelayContext'

class SettingsScreenBase extends PureComponent {
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
      const conversation = this.props.navigation.getParam('conversation')
      await this.props.context.mutations.conversationInvite({
        conversation,
        contacts: contactsID.map(id => ({
          ...contactUtils.default,
          id,
        })),
      })
      this.props.navigation.navigate('chats/detail', conversation)
    } catch (err) {
      console.error(err)
    }
  }

  onDeleteConversation = async () => {
    const conversation = this.props.navigation.getParam('conversation')
    const { id } = conversation
    try {
      await this.props.context.mutations.conversationRemove({ id })
      this.props.navigation.popToTop()
    } catch (err) {
      console.error(err)
    }
  }

  render () {
    const conversation = this.props.navigation.getParam('conversation')
    const { edit, t, navigation, context } = this.props
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
          {oneToOneContact ? (
            <Menu.Section>
              <Menu.Item
                icon='user'
                title={t('contacts.details')}
                onPress={() =>
                  navigation.navigate('chats/contact/detail/list', {
                    contact: oneToOneContact,
                    editRoute: 'chats/contact/detail/edit',
                  })
                }
              />
            </Menu.Section>
          ) : (
            <Menu.Section title={`${members.length} members`}>
              <Menu.Item
                icon='user-plus'
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
                icon='link'
                title={t('chats.link-invite')}
                color={colors.blue}
                onPress={() => console.log('Invite to group with a link')}
              />
              {members.map(member => {
                const { id, contact, contactId } = member
                const { displayName, overrideDisplayName } = contact || {
                  id: contactId,
                  displayName: '?????',
                }
                return (
                  <Menu.Item
                    key={id}
                    icon={<Avatar data={{ id: contactId }} size={28} />}
                    title={overrideDisplayName || displayName}
                    onPress={() =>
                      showContact({
                        context,
                        navigation,
                        data: contact || { id: contactId },
                        detailRoute: 'chats/contact/detail/list',
                        editRoute: 'chats/contact/detail/edit',
                      })
                    }
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

const SettingsScreen = withRelayContext(
  withNavigation(withNamespaces()(SettingsScreenBase))
)

class ListBase extends PureComponent {
  render () {
    const { navigation, context } = this.props
    const conversation = navigation.getParam('conversation')
    const { id } = conversation
    const { queries } = context

    return (
      <QueryReducer
        query={queries.Conversation.graphql}
        variables={merge([queries.Conversation.defaultVariables, { id }])}
      >
        {(state, retry) => {
          if (state.type === state.error) {
            setTimeout(() => retry(), 1000)
          }

          return (
            <SettingsScreen
              navigation={navigation}
              context={context}
              conversation={
                state.type === state.success
                  ? state.data.Conversation
                  : conversation
              }
              retry={retry}
            />
          )
        }}
      </QueryReducer>
    )
  }
}

const List = withGoBack(withRelayContext(ListBase))

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
