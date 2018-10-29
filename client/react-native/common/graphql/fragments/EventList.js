import { graphql, createPaginationContainer } from 'react-relay'

import { event } from '../../utils'
import { merge } from '../../helpers'
import { queries } from '../../graphql'
import { updater } from '../../relay'

const EventList = component =>
  createPaginationContainer(
    component,
    graphql`
      fragment EventList on Query
        @argumentDefinitions(
          filter: { type: BertyP2pEventInput }
          count: { type: "Int32" }
          cursor: { type: "String" }
        ) {
        EventList(
          filter: $filter
          first: $count
          after: $cursor
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
    `,
    {
      direction: 'forward',
      getConnectionFromProps (props) {
        return props.data.EventList
      },
      getFragmentVariables (prevVars, totalCount) {
        return {
          ...prevVars,
          count: totalCount,
        }
      },
      getVariables (props, { count, cursor }, fragmentVariables) {
        return {
          ...fragmentVariables,
          count,
          cursor:
            props.data.EventList.edges[props.data.EventList.edges.length - 1]
              .cursor,
        }
      },
      query: queries.EventList,
    }
  )
EventList.defaultArguments = {
  filter: event.default,
  orderBy: 'created_at',
  orderDesc: true,
}
EventList.updater = (store, args = {}) =>
  updater(store).connection(
    'EventList_EventList',
    merge([EventList.defaultArguments, args])
  )

export default EventList
