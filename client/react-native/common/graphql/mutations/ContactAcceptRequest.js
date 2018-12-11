import { graphql } from 'react-relay'

import { commit } from '../../relay'
import { contact } from '../../utils'
import { merge } from '../../helpers'

const ContactAcceptRequestMutation = graphql`
  mutation ContactAcceptRequestMutation(
    $id: ID!
    $displayName: String!
    $displayStatus: String!
    $overrideDisplayName: String!
    $overrideDisplayStatus: String!
  ) {
    ContactAcceptRequest(
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
    ContactAcceptRequestMutation,
    'ContactAcceptRequest',
    merge([contact.default, input]),
    {
      updater: (store, data) =>
        context.updaters.contactList.forEach(updater =>
          updater(store, data.ContactAcceptRequest)
        ),
      ...configs,
    }
  )
