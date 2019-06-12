import { fetchQuery, graphql } from 'react-relay'

import { event } from '@berty/relay/utils'
import { merge } from '@berty/common/helpers'

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
      sourceDeviceId
      createdAt
      updatedAt
      sentAt
      receivedAt
      ackedAt
      direction
      apiVersion
      kind
      attributes
      seenAt
      ackStatus
      dispatches {
        eventId
        deviceId
        contactId
        sentAt
        ackedAt
        seenAt
        ackMedium
        seenMedium
      }
      sourceContactId
      targetType
      targetAddr
      metadata {
        key
        values
      }
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
