import { graphql } from 'react-relay'

export default graphql`
  query ContactListQuery {
    ContactList {
      id
      displayName
      overrideDisplayName
      status
    }
  }
`
