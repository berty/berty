import { graphql } from 'react-relay'

export default graphql`
  mutation contactRequestMutation($id: String) {
    ContactRequest(id: $id) {
      id
      createdAt {
        seconds
        nanos
      }
      updatedAt {
        seconds
        nanos
      }
      deletedAt {
        seconds
        nanos
      }
      status
      devices {
        id
        createdAt {
          seconds
          nanos
        }
        updatedAt {
          seconds
          nanos
        }
        deletedAt {
          seconds
          nanos
        }
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
