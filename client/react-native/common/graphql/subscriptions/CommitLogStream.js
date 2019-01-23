import { graphql } from 'react-relay'

import { subscriber } from '../../relay'

export const CommitLogStream = graphql`
  subscription CommitLogStreamSubscription {
    CommitLogStream(T: true) {
      operation
      entity {
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
        device {
          id
          createdAt
          updatedAt
          name
          status
          apiVersion
          contactId
        }
        conversation {
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
        conversationMember {
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
        }
        event {
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
        devicePushConfig {
          id
          createdAt
          updatedAt
          deviceId
          pushType
          pushId
          relayPubkey
        }
      }
    }
  }
`

export default context =>
  subscriber({
    environment: context.environment,
    subscription: CommitLogStream,
  })
