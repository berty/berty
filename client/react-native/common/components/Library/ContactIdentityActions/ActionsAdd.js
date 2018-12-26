import React from 'react'
import { withNavigation } from 'react-navigation'
import RelayContext from '../../../relay/RelayContext'
import defaultValuesContact from '../../../utils/contact'
import { btoa } from 'b64-lite'
import ActionList from './ActionList'
import { withNamespaces } from 'react-i18next'

const ActionsAdd = ({ data, self, navigation, inModal, t }) => <RelayContext.Consumer>{({ mutations }) =>
  <ActionList inModal={inModal}>
    <ActionList.Action icon={'plus'} title={t('contacts.add-action')} dismissOnSuccess action={async () => {
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
    }} successMessage={t('contacts.add-action-feedback')} />
  </ActionList>
}</RelayContext.Consumer>

export default withNamespaces()(withNavigation(ActionsAdd))
