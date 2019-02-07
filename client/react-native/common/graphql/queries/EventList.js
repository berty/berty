import { fetchQuery, graphql } from 'react-relay'

import { event } from '../../utils'
import { merge } from '../../helpers'

const query = graphql`
  query EventListQuery(
    $filter: BertyEntityEventInput
    $orderBy: String!
    $orderDesc: Bool!
    $count: Int32
    $cursor: String
    $onlyWithoutAckedAt: Enum
  ) {
    ...EventList
      @arguments(
        filter: $filter
        orderBy: $orderBy
        orderDesc: $orderDesc
        count: $count
        cursor: $cursor
        onlyWithoutAckedAt: $onlyWithoutAckedAt
      )
  }
`

export const defaultVariables = {
  filter: event.default,
  orderBy: 'created_at',
  orderDesc: true,
  count: 5,
  cursor: '',
  onlyWithoutAckedAt: 0,
}

export default context => ({
  graphql: query,
  defaultVariables,
  fetch: async variables =>
    (await fetchQuery(
      context.environment,
      query,
      merge([defaultVariables, variables])
    )).EventList,
})
