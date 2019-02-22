import { withNamespaces } from 'react-i18next'
import { withNavigation } from 'react-navigation'
import React from 'react'

import ActionList from './ActionList'
import RelayContext from '../../../relay/RelayContext'

const ActionsAdd = ({ data, self, navigation, inModal, t }) => (
  <RelayContext.Consumer>
    {({ mutations }) => (
      <ActionList inModal={inModal}>
        <ActionList.Action
          icon={'plus'}
          title={t('contacts.add-action')}
          dismissOnSuccess
          action={async () => {
            await mutations.contactRequest({
              contactId: data.id,
              contactOverrideDisplayName:
                data.overrideDisplayName || data.displayName || '',
              introText: '',
            })

            const beforeDismiss = navigation.getParam('beforeDismiss')
            if (beforeDismiss) {
              beforeDismiss()
            }
          }}
          successMessage={t('contacts.add-action-feedback')}
        />
      </ActionList>
    )}
  </RelayContext.Consumer>
)

export default withNamespaces()(withNavigation(ActionsAdd))
