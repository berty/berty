import { graphql } from 'react-relay'
import { commit } from '../../relay'

const DevicePushConfigCreate = graphql`
  mutation DevicePushConfigCreateMutation(
    $pushType: Enum
    $pushId: [Byte!]
    $relayPubkey: String!
  ) {
    DevicePushConfigCreate(
      pushType: $pushType
      pushId: $pushId
      relayPubkey: $relayPubkey
    ) {
      id
      createdAt
      updatedAt
      deviceId
      pushType
      pushId
      relayPubkey
    }
  }
`

export default context => (input, configs) =>
  commit(
    context.environment,
    DevicePushConfigCreate,
    'DevicePushConfigCreate',
    input,
    configs
  )
