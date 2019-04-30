import { graphql } from 'react-relay'

import { commit } from '../../relay'
import { merge } from '@berty/common/helpers'

const ContactAcceptRequestMutation = graphql`
  mutation ContactAcceptRequestMutation($contactId: ID!) {
    ContactAcceptRequest(contactId: $contactId) {
      id
      createdAt
      updatedAt
      sigchain
      status
      devices {
        id
        createdAt
        updatedAt
        name
        status
        apiVersion
        contactId
      }
      displayName
      displayStatus
      overrideDisplayName
      overrideDisplayStatus
    }
  }
`

export default context => (input, configs) =>
  commit(
    context.environment,
    ContactAcceptRequestMutation,
    'ContactAcceptRequest',
    merge([{ contactId: '' }, input]),
    configs
  )
