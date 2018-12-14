import React from 'react'
import { colors } from '../../../constants'
import ActionList from './ActionList'
import RelayContext from '../../../relay/RelayContext'

const ReceivedActions = ({ data: { id } }, inModal) => <RelayContext.Consumer>{({ mutations }) =>
  <ActionList inModal={inModal}>
    <ActionList.Action icon={'check'} color={colors.blue} title={'Accept'}
      action={() => mutations.contactAcceptRequest({ id })}
      successMessage={'Contact request has been accepted'} />
    <ActionList.Action icon={'x'} color={colors.white} title={'Decline'}
      action={() => mutations.contactRemove({ id })}
      successMessage={'Contact request has been declined'} />
  </ActionList>
}</RelayContext.Consumer>

export default ReceivedActions
