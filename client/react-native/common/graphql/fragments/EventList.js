import { graphql } from 'react-relay'

import { event } from '../../utils'
import { merge } from '../../helpers'
import { updater as updaterHelper } from '../../relay'

export const defaultArguments = {
  default: {
    filter: event.default,
    orderBy: 'created_at',
    orderDesc: true,
  },
}

export const updater = {
  default: (store, args = {}) =>
    updaterHelper(store).connection(
      'EventList_EventList',
      merge([defaultArguments.default, args])
    ),
}

export default graphql`
  fragment EventList on Query
    @argumentDefinitions(
      filter: { type: BertyP2pEventInput }
      count: { type: "Int32" }
      cursor: { type: "String" }
      onlyWithoutAckedAt: { type: "Enum" }
    ) {
    EventList(
      filter: $filter
      first: $count
      after: $cursor
      onlyWithoutAckedAt: $onlyWithoutAckedAt
      orderBy: "created_at"
      orderDesc: true
    ) @connection(key: "EventList_EventList") {
      edges {
        cursor
        node {
          id
          ...Event
        }
      }
      pageInfo {
        count
        hasNextPage
        hasPreviousPage
        endCursor
        startCursor
      }
    }
  }
`
