import { fetchQuery, graphql } from 'react-relay'

import { conversation } from '../../utils'
import { merge } from '../../helpers'

const query = graphql`
  query ConversationQuery(
    $id: ID!
    $createdAt: GoogleProtobufTimestampInput
    $updatedAt: GoogleProtobufTimestampInput
    $readAt: GoogleProtobufTimestampInput
    $title: String!
    $topic: String!
    $members: [BertyEntityConversationMemberInput]
  ) {
    Conversation(
      id: $id
      createdAt: $createdAt
      updatedAt: $updatedAt
      readAt: $readAt
      title: $title
      topic: $topic
      members: $members
    ) {
      ...Conversation
      id
      createdAt
      updatedAt
      readAt
      title
      topic
      members {
        id
        createdAt
        updatedAt
        status
        contact {
          id
          createdAt
          updatedAt
          sigchain
          status
          devices {
            id
            createdAt
            updatedAt
            name
            status
            apiVersion
            contactId
          }
          displayName
          displayStatus
          overrideDisplayName
          overrideDisplayStatus
        }
        conversationId
        contactId
      }
    }
  }
`

export const defaultVariables = conversation.default

export default context => ({
  graphql: query,
  defaultVariables,
  fetch: async variables =>
    (await fetchQuery(
      context.environment,
      query,
      merge([defaultVariables, variables])
    )).Conversation,
})
