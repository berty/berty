import React from 'react'

import { View } from 'react-native'
import {
  ContactIdentity,
  ContactIdentityActions,
  ModalScreen,
} from '@berty/component'
import { withNavigation } from 'react-navigation'
import { Store } from '@berty/container'

const modalWidth = 320

@withNavigation
class ContactCardModal extends React.Component {
  static router = ContactIdentity.router

  render() {
    const { navigation } = this.props
    const navigationData = {
      id: navigation.getParam('id'),
      displayName: navigation.getParam('displayName'),
      status: navigation.getParam('status'),
    }

    return (
      <Store.Entity.Contact id={navigationData.id}>
        {(data = navigationData) => (
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <ModalScreen
              showDismiss
              width={modalWidth}
              footer={
                <ContactIdentityActions data={data} modalWidth={modalWidth} />
              }
            >
              <ContactIdentity data={data} />
            </ModalScreen>
          </View>
        )}
      </Store.Entity.Contact>
    )
  }
}

export default ContactCardModal
