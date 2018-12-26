import React from 'react'
import { colors } from '../../../constants'
import ActionList from './ActionList'
import RelayContext from '../../../relay/RelayContext'
import { withNamespaces } from 'react-i18next'

const ActionsSent = ({ data, inModal, t }) => <RelayContext.Consumer>{({ mutations }) =>
  <ActionList inModal={inModal}>
    <ActionList.Action icon={'send'} color={colors.green} title={t('contacts.resend-action')} dismissOnSuccess
      action={() => mutations.contactRequest({
        contact: Object.keys(data).filter(key => key.substring(0, 2) !== '__').reduce((acc, key) => ({
          ...acc,
          [key]: data[key],
        }), {}),
        introText: '',
      })}
      successMessage={t('contacts.resend-action-feedback')} />
    <ActionList.Action icon={'x'} color={colors.white} title={inModal ? t('contacts.cancel-request-action') : null}
      action={() => mutations.contactRemove({ id: data.id })}
      successMessage={t('contacts.cancel-request-action-feedback')} />
  </ActionList>
}</RelayContext.Consumer>

export default withNamespaces()(ActionsSent)
