import { graphql } from 'react-relay'

import { commit } from '../../relay'
import { contact } from '@berty/relay/utils'
import { merge } from '@berty/common/helpers'

const ContactUpdateMutation = graphql`
  mutation ContactUpdateMutation(
    $id: ID!
    $displayName: String!
    $displayStatus: String!
    $overrideDisplayName: String!
    $overrideDisplayStatus: String!
  ) {
    ContactUpdate(
      id: $id
      displayName: $displayName
      displayStatus: $displayStatus
      overrideDisplayName: $overrideDisplayName
      overrideDisplayStatus: $overrideDisplayStatus
    ) {
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
    ContactUpdateMutation,
    'ContactUpdateMutation',
    merge([contact.default, input]),
    configs
  )
