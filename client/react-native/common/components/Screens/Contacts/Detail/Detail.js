import React, { PureComponent } from 'react'
import { Image, Share, ActionSheetIOS, Platform, Alert } from 'react-native'
import { Menu, Header, Screen } from '../../../Library'
import { colors } from '../../../../constants'

export default class Detail extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header
        navigation={navigation}
        title='Contact details'
        rightBtnIcon={'edit-2'}
        onPressRightBtn={() =>
          navigation.push('detail/edit', {
            contact: navigation.getParam('contact'),
          })
        }
        backBtn
      />
    ),
  })

  blockContact = () => {
    console.log('Block')
  }

  blockConfirm = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Block this contact', 'Cancel'],
          destructiveButtonIndex: 0,
          cancelButtonIndex: 1,
        },
        buttonIndex => {
          if (buttonIndex === 1) {
            this.blockContact()
          }
        }
      )
    } else if (Platform.OS === 'android') {
      Alert.alert(
        'Confirm',
        'Are you sure you want to block this contact?',
        [
          {
            text: 'Block it (not implem.)',
            onPress: () => this.blockContact(),
            style: 'destructive',
          },
          {
            text: 'Cancel',
            onPress: () => this.blockContact(),
            style: 'cancel',
          },
        ],
        { cancelable: false }
      )
    } else {
      console.warn('TODO: implement alert')
      this.blockContact()
    }
  }

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
              title='Send a message (not implem.)'
              onPress={() => console.log('Send')}
            />
            <Menu.Item
              icon='phone'
              title='Call (not implem.)'
              onPress={() => console.log('Call')}
            />
          </Menu.Section>
          <Menu.Section>
            <Menu.Item
              icon='eye'
              title='View public key'
              onPress={() =>
                navigation.push('detail/publickey', { id: contact.id })
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
              onPress={() => this.blockConfirm()}
            />
          </Menu.Section>
        </Menu>
      </Screen>
    )
  }
}
