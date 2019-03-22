import { graphql } from 'react-relay'

import { commit } from '../../relay'
// import { updaters } from '..'

const ConversationUpdateMutation = graphql`
  mutation ConversationUpdateMutation(
    $id: ID!
    $createdAt: GoogleProtobufTimestampInput
    $updatedAt: GoogleProtobufTimestampInput
    $readAt: GoogleProtobufTimestampInput
    $title: String!
    $topic: String!
    $infos: String!
    $members: [BertyEntityConversationMemberInput]
  ) {
    ConversationUpdate(
      id: $id
      createdAt: $createdAt
      updatedAt: $updatedAt
      readAt: $readAt
      title: $title
      topic: $topic
      infos: $infos
      members: $members
    ) {
      ...Conversation
      id
      createdAt
      updatedAt
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

export default context => (input, configs) =>
  commit(
    context.environment,
    ConversationUpdateMutation,
    'ConversationUpdate',
    input,
    configs
  )
