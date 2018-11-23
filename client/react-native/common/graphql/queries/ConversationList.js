import { fetchQuery, graphql } from 'react-relay'

import { merge } from '../../helpers'

const query = graphql`
  query ConversationListQuery(
    $filter: BertyEntityConversationInput
    $count: Int32
    $cursor: String
  ) {
    ...ConversationList
      @arguments(filter: $filter, count: $count, cursor: $cursor)
  }
`

const defaultVariables = {
  filter: null,
  count: 50,
  cursor: '',
}

export default context => ({
  graphql: query,
  defaultVariables,
  fetch: variables =>
    fetchQuery(
      context.environment,
      query,
      merge([defaultVariables, variables])
    ),
})
