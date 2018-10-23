import { graphql, createFragmentContainer } from 'react-relay'

export default component =>
  createFragmentContainer(
    component,
    graphql`
      fragment Conversation on BertyEntityConversation {
        id
        createdAt
        updatedAt
        deletedAt
        title
        topic
        members {
          id
          createdAt
          updatedAt
          deletedAt
          status
          contact {
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
          conversationId
          contactId
        }
      }
    `
  )
