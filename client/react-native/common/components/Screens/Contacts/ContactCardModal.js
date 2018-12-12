import React from 'react'
import { withNavigation } from 'react-navigation'
import { View } from 'react-native'
import { ContactIdentityActions, ContactIdentity, ModalScreen } from '../../Library'

const modalWidth = 320

const ContactCardModal = ({ navigation }) => {
  const data = navigation.getParam('data')

  return <View style={{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }}>
    <ModalScreen showDismiss width={modalWidth} footer={<ContactIdentityActions data={data} modalWidth={modalWidth} />} >
      <ContactIdentity data={data} />
    </ModalScreen>
  </View>
}

export default withNavigation(ContactCardModal)
