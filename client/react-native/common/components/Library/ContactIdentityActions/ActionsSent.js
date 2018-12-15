import React from 'react'
import { colors } from '../../../constants'
import ActionList from './ActionList'
import RelayContext from '../../../relay/RelayContext'

const ActionsSent = ({ data, inModal }) => <RelayContext.Consumer>{({ mutations }) =>
  <ActionList inModal={inModal}>
    <ActionList.Action icon={'send'} color={colors.green} title={'Resend'} dismissOnSuccess
      action={() => mutations.contactRequest({
        contact: Object.keys(data).filter(key => key.substring(0, 2) !== '__').reduce((acc, key) => ({
          ...acc,
          [key]: data[key],
        }), {}),
        introText: '',
      })}
      successMessage={'Contact invitation has been sent again'} />
    <ActionList.Action icon={'x'} color={colors.white} title={inModal ? 'Remove' : null}
      action={() => mutations.contactRemove({ id: data.id })}
      successMessage={'Contact invitation has been removed'} />
  </ActionList>
}</RelayContext.Consumer>

export default ActionsSent
