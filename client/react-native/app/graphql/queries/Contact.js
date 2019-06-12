import { fetchQuery, graphql } from 'react-relay'
import { contact } from '@berty/relay/utils'
import { merge } from '@berty/common/helpers'

const query = graphql`
  query ContactQuery(
    $id: ID!
    $createdAt: GoogleProtobufTimestampInput
    $updatedAt: GoogleProtobufTimestampInput
    $sigchain: [Byte!]
    $status: Enum
    $devices: [BertyEntityDeviceInput]
    $displayName: String!
    $displayStatus: String!
    $overrideDisplayName: String!
    $overrideDisplayStatus: String!
  ) {
    Contact(
      id: $id
      createdAt: $createdAt
      updatedAt: $updatedAt
      sigchain: $sigchain
      status: $status
      devices: $devices
      displayName: $displayName
      displayStatus: $displayStatus
      overrideDisplayName: $overrideDisplayName
      overrideDisplayStatus: $overrideDisplayStatus
    ) {
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
      ...Contact
    }
  }
`

const defaultVariables = contact.default

export default context => ({
  graphql: query,
  defaultVariables,
  fetch: async variables =>
    (await fetchQuery(
      context.environment,
      query,
      merge([defaultVariables, variables])
    )).Contact,
})
