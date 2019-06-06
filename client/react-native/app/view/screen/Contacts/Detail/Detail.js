import { ActionSheetIOS, Alert, Platform } from 'react-native'
import { withNamespaces } from 'react-i18next'
import I18n from 'i18next'
import React, { PureComponent } from 'react'

import { Avatar, Header, Menu, Screen } from '@berty/component'
import { colors } from '@berty/common/constants'
import { withRelayContext } from '@berty/relay/context'
import { Store } from '@berty/container'
import { withGoBack } from '@berty/component/BackActionProvider'

class DetailsBase extends PureComponent {
  blockContact = () => {
    console.log('Block')
  }

  blockConfirm = () => {
    const { t } = this.props

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [t('contact.block-confirm-action'), t('cancel')],
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
        t('confirm'),
        t('contact.block-confirm-question'),
        [
          {
            text: t('contact.block-confirm-action'),
            onPress: () => this.blockContact(),
            style: 'destructive',
          },
          {
            text: t('cancel'),
            onPress: () => {},
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

  deleteContact = async () => {
    try {
      await this.props.context.contactRemove({
        id: this.props.navigation.getParam('id'),
      })
      this.props.goBack(null)
    } catch (err) {
      console.error(err)
    }
  }

  render () {
    const { navigation, t } = this.props
    const id = navigation.getParam('id')
    return (
      <Store.Entity.Contact id={id}>
        {data =>
          (
            <Screen>
              <Menu absolute>
                <Menu.Header
                  icon={<Avatar data={data} size={78} />}
                  title={data.overrideDisplayName || data.displayName}
                />
                <Menu.Section>
                  <Menu.Item
                    icon='message-circle'
                    title={t('contacts.send-message')}
                    onPress={() => console.log('Send')}
                  />
                  <Menu.Item
                    icon='phone'
                    title={t('contacts.call')}
                    onPress={() => console.log('Call')}
                  />
                </Menu.Section>
                <Menu.Section>
                  <Menu.Item
                    icon='eye'
                    title={t('contacts.view-pub-key')}
                    onPress={() =>
                      navigation.navigate('modal/contacts/card', data)
                    }
                  />
                </Menu.Section>
                <Menu.Section>
                  <Menu.Item
                    icon='slash'
                    title={t('contacts.block')}
                    color={colors.error}
                    onPress={() => this.blockConfirm()}
                  />
                </Menu.Section>
                <Menu.Section>
                  <Menu.Item
                    icon='slash'
                    title={t('contacts.delete')}
                    color={colors.error}
                    onPress={this.deleteContact}
                  />
                </Menu.Section>
              </Menu>
            </Screen>
          )
        }
      </Store.Entity.Contact>
    )
  }
}

const Details = withGoBack(withRelayContext(withNamespaces()(DetailsBase)))

Details.navigationOptions = ({ navigation }) => ({
  header: (
    <Header
      navigation={navigation}
      title={I18n.t('contacts.details')}
      rightBtnIcon={'edit-2'}
      onPressRightBtn={() =>
        navigation.navigate(
          navigation.getParam('editRoute', 'chats/contact/detail/list'),
          {
            contact: navigation.getParam('contact'),
          }
        )
      }
      backBtn
    />
  ),
})

export default Details
