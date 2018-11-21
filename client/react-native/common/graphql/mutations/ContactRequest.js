import { graphql } from 'react-relay'
import { commit } from '../../relay'
import { contact } from '../../utils'

const ContactRequestMutation = graphql`
  mutation ContactRequestMutation(
    $contact: BertyEntityContactInput
    $introText: String!
  ) {
    ContactRequest(contact: $contact, introText: $introText) {
      id
      createdAt
      updatedAt
      deletedAt
      sigchain
      status
      devices {
        id
        createdAt
        updatedAt
        deletedAt
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
    {
      ...contact.default,
      ...input,
    },
    configs
  )
