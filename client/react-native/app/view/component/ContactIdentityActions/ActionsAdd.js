import { withNamespaces } from 'react-i18next'
import { withNavigation } from 'react-navigation'
import React from 'react'

import ActionList from './ActionList'
import { withStoreContext } from '@berty/store/context'

const ActionsAdd = withStoreContext(
  ({ data, self, context, navigation, inModal, t }) => (
    <ActionList inModal={inModal}>
      <ActionList.Action
        icon={'plus'}
        title={t('contacts.add-action')}
        dismissOnSuccess
        action={async () => {
          await context.node.service.contactRequest({
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
  )
)

export default withNamespaces()(withNavigation(ActionsAdd))
