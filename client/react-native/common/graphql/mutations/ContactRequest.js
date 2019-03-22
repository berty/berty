import { graphql } from 'react-relay'

import { commit } from '../../relay'
import { merge } from '../../helpers'

const ContactRequestMutation = graphql`
  mutation ContactRequestMutation(
    $contactId: ID!
    $contactOverrideDisplayName: String!
    $introText: String!
  ) {
    ContactRequest(
      contactId: $contactId
      contactOverrideDisplayName: $contactOverrideDisplayName
      introText: $introText
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
    ContactRequestMutation,
    'ContactRequest',
    merge([{ id: '', contactOverrideDisplayName: '', introText: '' }, input]),
    configs
  )
