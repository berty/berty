import { graphql } from 'react-relay'
import { event } from '../../utils'

const EventList = graphql`
  query EventListQuery(
    $filter: BertyP2pEventInput
    $count: Int32
    $cursor: String
  ) {
    ...EventList @arguments(filter: $filter, count: $count, cursor: $cursor)
  }
`

EventList.defaultVariables = {
  filter: event.default,
  count: 5,
  cursor: new Date(Date.now()).toISOString(),
}

export default EventList
