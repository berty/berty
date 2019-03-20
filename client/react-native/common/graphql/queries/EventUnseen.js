import { fetchQuery, graphql } from 'react-relay'

import { event } from '../../utils'
import { merge } from '../../helpers'

const query = graphql`
  query EventUnseenQuery(
    $filter: BertyEntityEventInput
    $orderBy: String!
    $orderDesc: Bool!
    $count: Int32
    $cursor: String
    $onlyWithoutAckedAt: Enum
    $onlyWithoutSeenAt: Enum
  ) {
    EventUnseen(
      filter: $filter
      orderBy: $orderBy
      orderDesc: $orderDesc
      first: $count
      after: $cursor
      onlyWithoutAckedAt: $onlyWithoutAckedAt
      onlyWithoutSeenAt: $onlyWithoutSeenAt
    ) {
        id
        senderId
        createdAt
        updatedAt
        sentAt
        seenAt
        receivedAt
        ackedAt
        direction
        senderApiVersion
        receiverApiVersion
        receiverId
        kind
        attributes
        conversationId
    }
}
`

export const defaultVariables = {
  filter: event.default,
  orderBy: 'created_at',
  orderDesc: true,
  count: 5,
  cursor: '',
  onlyWithoutAckedAt: 0,
  onlyWithoutSeenAt: 0,
}

export default context => ({
  graphql: query,
  defaultVariables,
  fetch: async variables =>
    (await fetchQuery(
      context.environment,
      query,
      merge([defaultVariables, variables])
    )).EventUnseen,
})
