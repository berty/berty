import { fetchQuery, graphql } from 'react-relay'

const query = graphql`
  query ContactCheckPublicKeyQuery(
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
    ContactCheckPublicKey(
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
      ret
    }
  }
`

export default context => ({
  graphql: query,
  fetch: async (variables = {}) =>
    (await fetchQuery(context.environment, query, variables))
      .ContactCheckPublicKey,
})
