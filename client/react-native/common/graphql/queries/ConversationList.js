import { graphql } from 'react-relay'

const ConversationList = graphql`
  query ConversationListQuery(
    $filter: BertyEntityConversationInput
    $count: Int32
    $cursor: String
  ) {
    ...ConversationList
      @arguments(filter: $filter, count: $count, cursor: $cursor)
  }
`

ConversationList.defaultVariables = {
  fileter: null,
  count: 50,
  cursor: '',
}

export default ConversationList
