import { graphql } from 'react-relay'

export default graphql`
  mutation ContactRequestMutation($contactID: String!, $introText: String) {
    ContactRequest(contactID: $contactID, introText: $introText) {
      id
      createdAt
      updatedAt
      deletedAt
      status
    }
  }
`
