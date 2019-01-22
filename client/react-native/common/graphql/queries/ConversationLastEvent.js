import { fetchQuery, graphql } from 'react-relay'

import { merge } from '../../helpers'

const query = graphql`
  query ConversationLastEventQuery($id: ID!) {
    ConversationLastEvent(id: $id) {
      ...Event
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
