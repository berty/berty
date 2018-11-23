import { fetchQuery, graphql } from 'react-relay'

import { event } from '../../utils'
import { merge } from '../../helpers'

const query = graphql`
  query EventListQuery(
    $filter: BertyP2pEventInput
    $count: Int32
    $cursor: String
    $onlyWithoutAckedAt: Enum
  ) {
    ...EventList
      @arguments(
        filter: $filter
        count: $count
        cursor: $cursor
        onlyWithoutAckedAt: $onlyWithoutAckedAt
      )
  }
`

const defaultVariables = {
  filter: event.default,
  count: 5,
  cursor: new Date(Date.now()).toISOString(),
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
