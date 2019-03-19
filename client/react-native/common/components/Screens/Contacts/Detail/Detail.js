import { ActionSheetIOS, Alert, Platform } from 'react-native'
import { withNamespaces } from 'react-i18next'
import I18n from 'i18next'
import React, { PureComponent } from 'react'

import { Avatar, Header, Menu, Screen } from '../../../Library'
import { colors } from '../../../../constants'
import { contact as contactHelper } from '../../../../utils'
import withRelayContext from '../../../../helpers/withRelayContext'
import { withGoBack } from '../../../Library/BackActionProvider'

class DetailsBase extends PureComponent {
  blockContact = () => {
    console.log('Block')
  }

  blockConfirm = () => {
    const { t } = this.props

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          'options': [
            t('contact.block-confirm-action'),
            t('cancel'),
          ],
          'destructiveButtonIndex': 0,
          'cancelButtonIndex': 1,
        },
        (buttonIndex) => {
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
            'text': t('contact.block-confirm-action'),
            'onPress': () => this.blockContact(),
            'style': 'destructive',
          },
          {
            'text': t('cancel'),
            'onPress': () => {},
            'style': 'cancel',
          },
        ],
        { 'cancelable': false }
      )
    } else {
      console.warn('TODO: implement alert')
      this.blockContact()
    }
  }

  deleteContact = async () => {
    try {
      await this.props.context.mutations.contactRemove({
        'id': this.props.navigation.getParam('contact').id,
      })
      this.props.goBack(null)
    } catch (err) {
      console.error(err)
    }
  }

  render () {
    const { navigation, t } = this.props
    const contact = navigation.getParam('contact')
    if (contact == null) {
      return null
    }
    return (
      <Screen>
        <Menu absolute>
          <Menu.Header
            icon={<Avatar data={contact} size={78} />}
            title={contact.overrideDisplayName || contact.displayName}
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
              onPress={() => navigation.navigate('modal/contacts/card', {
                ...contact,
                'id': contactHelper.getCoreID(contact.id),
              })
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
}

const Details = withGoBack(withRelayContext(withNamespaces()(DetailsBase)))

Details.navigationOptions = ({ navigation }) => ({
  'header': (
    <Header
      navigation={navigation}
      title={I18n.t('contacts.details')}
      rightBtnIcon={'edit-2'}
      onPressRightBtn={() => navigation.navigate(
        navigation.getParam('editRoute', 'chats/contact/detail/list'),
        {
          'contact': navigation.getParam('contact'),
        }
      )
      }
      backBtn
    />
  ),
})

export default Details
