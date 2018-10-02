import { graphql } from 'react-relay'

export default graphql`
  query ContactListQuery($status: BertyEntityContactStatus) {
    ContactList(status: $status) {
      id
      displayName
      overrideDisplayName
      status
    }
  }
`
