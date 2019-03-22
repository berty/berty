import { fetchQuery, graphql } from 'react-relay'

import { merge } from '../../helpers'

const query = graphql`
  query ConversationLastEventQuery($id: ID!) {
    ConversationLastEvent(id: $id) {
      ...Event
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

export const defaultVariables = { id: '' }

export default context => ({
  graphql: query,
  defaultVariables,
  fetch: async variables =>
    (await fetchQuery(
      context.environment,
      query,
      merge([defaultVariables, variables])
    )).ConversationLastEvent,
})
