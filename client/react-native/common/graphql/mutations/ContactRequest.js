import { graphql } from 'react-relay'

export default graphql`
  mutation ContactRequestMutation($input: ContactRequestInput!) {
    ContactRequest(input: $input) {
      clientMutationId
      bertyEntityContact {
        id
        status
        displayName
        displayStatus
        overrideDisplayName
        overrideDisplayStatus
      }
    }
  }
`
