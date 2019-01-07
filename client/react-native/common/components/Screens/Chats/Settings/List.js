import { withNamespaces } from 'react-i18next'
import I18n from 'i18next'
import React, { PureComponent } from 'react'

import { RelayContext } from '../../../../relay'
import { Screen, Menu, Header, Badge, Avatar } from '../../../Library'
import { choosePicture } from '../../../../helpers/react-native-image-picker'
import { colors } from '../../../../constants'
import { conversation as utils } from '../../../../utils'

class List extends PureComponent {
  static contextType = RelayContext

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

  state = {
    edit: false,
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
    this.setState({ edit: false }, () =>
      this.props.navigation.setParams({ state: this.state })
    )
  }

  onChoosePicture = async event =>
    this.setState({ ...this.state, ...(await choosePicture(event)) })

  addMembers = async ({ contactsID }) => {
    try {
      const { id } = this.props.navigation.getParam('conversation')
      await this.props.screenProps.context.mutations.conversationInvite({
        conversationID: id,
        contactsID,
      })
    } catch (err) {
      console.error(err)
    }
    this.props.navigation.goBack(null)
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
    const { navigation, t } = this.props
    const { edit } = this.state
    const conversation = this.props.navigation.getParam('conversation')
    const title = utils.getTitle(conversation)
    return (
      <RelayContext.Consumer>
        {context =>
          (this.context = context) && (
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
                      <Avatar
                        data={conversation}
                        uri={this.state.uri}
                        size={78}
                      />
                    </Badge>
                  }
                  title={!edit && title}
                  description={
                    !edit && 'NOT TRANSLATED Conversation started 2 days ago'
                  }
                />
                {edit && (
                  <Menu.Section title={t('chats.name')}>
                    <Menu.Input value={title} />
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
                  <Menu.Section
                    title={`${conversation.members.length} members`}
                  >
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
      </RelayContext.Consumer>
    )
  }
}

export default withNamespaces()(List)
