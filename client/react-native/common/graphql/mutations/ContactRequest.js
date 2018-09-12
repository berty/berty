import { graphql } from 'react-relay'
import { commit } from '../../relay'

const ContactRequestMutation = graphql`
  mutation ContactRequestMutation($input: ContactRequestInput!) {
    ContactRequest(input: $input) {
      clientMutationId
      bertyEntityContact {
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
  }
`

export default {
  commit: input => commit(ContactRequestMutation, 'ContactRequest', input),
}
