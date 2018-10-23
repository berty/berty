import { graphql } from 'react-relay'

export default graphql`
  query ConversationListQuery(
    $filter: BertyEntityConversationInput
    $count: Int32
    $cursor: String
  ) {
    ...ConversationList
      @arguments(filter: $filter, count: $count, cursor: $cursor)
  }
`
