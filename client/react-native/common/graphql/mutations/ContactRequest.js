import { graphql } from 'react-relay'

export default graphql`
  mutation ContactRequestMutation($contactID: String!) {
    ContactRequest(contactID: $contactID) {
      id
      createdAt
      updatedAt
      deletedAt
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
