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
          infos
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
    }
  }
`

export default context =>
  subscriber({
    environment: context.environment,
    subscription: CommitLogStream,
  })
