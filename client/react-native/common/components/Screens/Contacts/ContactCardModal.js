import React from 'react'
import { withNavigation } from 'react-navigation'
import { View } from 'react-native'
import {
  ContactIdentityActions,
  ContactIdentity,
  ModalScreen,
} from '../../Library'

const modalWidth = 320

const ContactCardModal = ({ navigation }) => {
  const id = navigation.getParam('id')
  const displayName = navigation.getParam('displayName')

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <ModalScreen
        showDismiss
        width={modalWidth}
        footer={
          <ContactIdentityActions
            data={{ id, displayName }}
            modalWidth={modalWidth}
          />
        }
      >
        <ContactIdentity data={{ id, displayName }} />
      </ModalScreen>
    </View>
  )
}

export default withNavigation(ContactCardModal)
