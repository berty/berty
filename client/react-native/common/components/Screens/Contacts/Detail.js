import React, { PureComponent } from 'react'
import { Image, Share } from 'react-native'
import { Menu, Header, Screen } from '../../Library'
import { colors } from '../../../constants'

export default class Detail extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header
        navigation={navigation}
        title='Contact details'
        rightBtnIcon={'edit-2'}
        onPressRightBtn={() =>
          navigation.push('contacts/detail/edit', {
            contact: navigation.getParam('contact'),
          })
        }
        backBtn
      />
    ),
  })
  render () {
    const { navigation } = this.props
    const contact = navigation.getParam('contact')
    return (
      <Screen>
        <Menu absolute>
          <Menu.Header
            icon={
              <Image
                style={{ width: 78, height: 78, borderRadius: 39 }}
                source={{
                  uri:
                    'https://api.adorable.io/avatars/285/' +
                    contact.id +
                    '.png',
                }}
              />
            }
            title={contact.overrideDisplayName || contact.displayName}
          />
          <Menu.Section>
            <Menu.Item
              icon='message-circle'
              title='Send a message'
              onPress={() => console.log('Send')}
            />
            <Menu.Item
              icon='phone'
              title='Call'
              onPress={() => console.log('Call')}
            />
          </Menu.Section>
          <Menu.Section>
            <Menu.Item
              icon='eye'
              title='View public key'
              onPress={() =>
                navigation.push('contacts/detail/publickey', { id: contact.id })
              }
            />
            <Menu.Item
              icon='share'
              title='Share this contact'
              onPress={() =>
                Share.share({ message: contact.id }).catch(() => null)
              }
            />
          </Menu.Section>
          <Menu.Section>
            <Menu.Item
              icon='slash'
              title='Block this contact'
              color={colors.error}
              onPress={() => console.log('Block')}
            />
          </Menu.Section>
        </Menu>
      </Screen>
    )
  }
}
