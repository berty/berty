import { fetchQuery, graphql } from 'react-relay'

import { merge } from '@berty/common/helpers'

const query = graphql`
  query ConversationListQuery(
    $filter: BertyEntityConversationInput
    $orderBy: String!
    $orderDesc: Bool!
    $count: Int32
    $cursor: String
  ) {
    ...ConversationList
      @arguments(
        filter: $filter
        orderBy: $orderBy
        orderDesc: $orderDesc
        count: $count
        cursor: $cursor
      )
  }
`

const defaultVariables = {
  filter: null,
  orderBy: 'updated_at',
  orderDesc: true,
  count: 50,
  cursor: '',
}

export default context => ({
  graphql: query,
  defaultVariables,
  fetch: async variables =>
    (await fetchQuery(
      context.environment,
      query,
      merge([defaultVariables, variables])
    )).ConversationList,
})
