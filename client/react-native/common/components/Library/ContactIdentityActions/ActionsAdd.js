import React from 'react'
import { withNavigation } from 'react-navigation'
import RelayContext from '../../../relay/RelayContext'
import defaultValuesContact from '../../../utils/contact'
import ActionButton from './ActionButton'
import { showMessage } from 'react-native-flash-message'
import { btoa } from 'b64-lite'

const ActionsAdd = ({ data, self, navigation }) => <>
  <RelayContext.Consumer>{({ mutations }) =>
    <ActionButton icon={'plus'} title={'Add contact'}
      onPress={async () => {
        const input = {
          contact: {
            ...defaultValuesContact,
            ...data,
            id: btoa(`contact:${data.id}`),
          },
          introText: '',
        }

        try {
          await mutations.contactRequest(input)

          showMessage({
            message: 'A request has been sent to this contact',
            type: 'info',
            position: 'center',
          })

          const beforeDismiss = navigation.getParam('beforeDismiss')
          beforeDismiss()

          navigation.goBack(null)
        } catch (err) {
          showMessage({
            message: 'An error occurred while sending a request to this contact',
            type: 'danger',
            icon: 'danger',
            position: 'center',
          })
        }
      }}
    />
  }</RelayContext.Consumer>
</>

export default withNavigation(ActionsAdd)
