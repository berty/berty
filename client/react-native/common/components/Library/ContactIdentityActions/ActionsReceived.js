import React from 'react'
import { colors } from '../../../constants'
import ActionList from './ActionList'
import RelayContext from '../../../relay/RelayContext'
import { withNamespaces } from 'react-i18next'

const ReceivedActions = ({ data: { id }, inModal, t }) => <RelayContext.Consumer>{({ mutations }) =>
  <ActionList inModal={inModal}>
    <ActionList.Action icon={'check'} color={colors.blue} title={t('contacts.accept-action')}
      action={() => mutations.contactAcceptRequest({ id })}
      successMessage={t('contacts.accept-action-feedback')} />
    <ActionList.Action icon={'x'} color={colors.white} title={inModal ? t('contacts.decline-action') : null}
      action={() => mutations.contactRemove({ id })}
      successMessage={t('contacts.decline-action-feedback')} />
  </ActionList>
}</RelayContext.Consumer>

export default withNamespaces()(ReceivedActions)
