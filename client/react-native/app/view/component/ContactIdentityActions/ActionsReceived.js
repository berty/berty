import React from 'react'
import { colors } from '@berty/common/constants'
import ActionList from './ActionList'
import { withNamespaces } from 'react-i18next'
import { withStoreContext } from '@berty/store/context'

const ReceivedActions = withStoreContext(
  ({ data: { id }, inModal, t, context }) => (
    <ActionList inModal={inModal}>
      <ActionList.Action
        icon={'check'}
        color={colors.blue}
        title={t('contacts.accept-action')}
        action={() =>
          context.node.service.contactAcceptRequest({ contactId: id })
        }
        successMessage={t('contacts.accept-action-feedback')}
      />
      <ActionList.Action
        icon={'x'}
        color={colors.white}
        title={inModal ? t('contacts.decline-action') : null}
        action={() => context.node.service.contactRemove({ id })}
        successMessage={t('contacts.decline-action-feedback')}
      />
    </ActionList>
  )
)

export default withNamespaces()(ReceivedActions)
