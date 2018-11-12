import React, { PureComponent } from 'react'
import { Image } from 'react-native'
import { Screen, Menu, Header, Badge } from '../../../Library'
import { colors } from '../../../../constants'
import { conversation as utils } from '../../../../utils'
import { mutations } from '../../../../graphql'
import { choosePicture } from '../../../../helpers/react-native-image-picker'

export default class List extends PureComponent {
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
          title='Conversation details'
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
      await mutations.conversationInvite.commit({
        conversationID: id,
        contactsID,
      })
    } catch (err) {
      console.error(err)
    }
    this.props.navigation.goBack(null)
  }

  render () {
    const { navigation } = this.props
    const { edit } = this.state
    const conversation = this.props.navigation.getParam('conversation')
    const title = utils.getTitle(conversation)
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
                <Image
                  style={{ width: 78, height: 78, borderRadius: 39 }}
                  source={{
                    uri:
                      this.state.uri ||
                      'https://api.adorable.io/avatars/285/' +
                        conversation.id +
                        '.png',
                  }}
                />
              </Badge>
            }
            title={!edit && title}
            description={!edit && 'Conversation started 2 days ago'}
          />
          {edit && (
            <Menu.Section title='Name'>
              <Menu.Input value={title} />
            </Menu.Section>
          )}
          {!edit && (
            <Menu.Section>
              <Menu.Item
                icon='bell'
                title='Notifications'
                onPress={() => navigation.push('settings/notifications')}
              />
              <Menu.Item
                icon='clock'
                title='Message retention (not implem.)'
                onPress={() => console.log('Message retention')}
              />
            </Menu.Section>
          )}
          {conversation.members.length <= 2 ? (
            <Menu.Section>
              <Menu.Item
                icon='user'
                title='Contact details (not implem.)'
                onPress={() => console.log('Contact details')}
              />
            </Menu.Section>
          ) : (
            <Menu.Section title={`${conversation.members.length} members`}>
              <Menu.Item
                icon='user-plus'
                title='Add members'
                color={colors.blue}
                onPress={() =>
                  this.props.navigation.push('chats/add', {
                    onSubmit: this.addMembers,
                  })
                }
              />
              <Menu.Item
                icon='link'
                title='Invite to group with a link (not implem.)'
                color={colors.blue}
                onPress={() => console.log('Invite to group with a link')}
              />
              {conversation.members.map(
                ({ id, contact: { displayName, overrideDisplayName } }) => (
                  <Menu.Item
                    key={id}
                    icon={
                      <Image
                        style={{ height: 28, width: 28, borderRadius: 14 }}
                        source={{
                          uri:
                            'https://api.adorable.io/avatars/285/' +
                            (overrideDisplayName || displayName) +
                            '.png',
                        }}
                      />
                    }
                    title={overrideDisplayName || displayName}
                  />
                )
              )}
            </Menu.Section>
          )}
          <Menu.Section>
            <Menu.Item
              icon='trash-2'
              title='Delete this conversation (not implem.)'
              color={colors.error}
              onPress={() => console.log('Delete this conversation')}
            />
          </Menu.Section>
        </Menu>
      </Screen>
    )
  }
}
