import { graphql } from 'react-relay'

export default graphql`
  query ConversationListQuery {
    ConversationList {
      id
      title
      topic
      members {
        id
        status
        conversationId
        contactId
      }
    }
  }
`
