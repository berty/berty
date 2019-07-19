import React from 'react'
import { colors } from '@berty/common/constants'
import ActionList from './ActionList'
import { withNamespaces } from 'react-i18next'

const ActionsUnknown = ({ data, inModal, t, context }) => (
  <ActionList inModal={inModal}>
    <ActionList.Action
      icon={'send'}
      color={colors.green}
      title={t('contacts.request-action')}
      dismissOnSuccess
      action={() => {
        return context.node.service.contactRequest({
          contactId: data.id,
          contactOverrideDisplayName:
            data.overrideDisplayName || data.displayName || '',
          introText: '',
        })
      }}
      successMessage={t('contacts.request-action-feedback')}
    />
    <ActionList.Action
      icon={'x'}
      color={colors.white}
      title={inModal ? t('contacts.cancel-request-action') : null}
      action={() => context.node.service.contactRemove({ id: data.id })}
      successMessage={t('contacts.cancel-request-action-feedback')}
    />
  </ActionList>
)

export default withNamespaces()(ActionsUnknown)
