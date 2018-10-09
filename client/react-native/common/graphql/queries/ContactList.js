import { graphql } from 'react-relay'

export default graphql`
  query ContactListQuery($filter: BertyEntityContactInput) {
    ContactList(filter: $filter) {
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
