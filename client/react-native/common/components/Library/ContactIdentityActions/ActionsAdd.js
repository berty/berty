import React from 'react'
import { withNavigation } from 'react-navigation'
import RelayContext from '../../../relay/RelayContext'
import defaultValuesContact from '../../../utils/contact'
import { btoa } from 'b64-lite'
import ActionList from './ActionList'

const ActionsAdd = ({ data, self, navigation, inModal }) => <RelayContext.Consumer>{({ mutations }) =>
  <ActionList inModal={inModal}>
    <ActionList.Action icon={'plus'} title={'Add contact'} dismissOnSuccess action={async () => {
      await mutations.contactRequest({
        contact: {
          ...defaultValuesContact,
          ...data,
          id: btoa(`contact:${data.id}`),
        },
        introText: '',
      })

      const beforeDismiss = navigation.getParam('beforeDismiss')
      if (beforeDismiss) {
        beforeDismiss()
      }
    }} successMessage={'A request has been sent to this contact'} />
  </ActionList>
}</RelayContext.Consumer>

export default withNavigation(ActionsAdd)
