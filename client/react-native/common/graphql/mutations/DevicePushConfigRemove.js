import { graphql } from 'react-relay'
import { commit } from '../../relay'

const DevicePushConfigRemove = graphql`
  mutation DevicePushConfigRemoveMutation(
    $id: ID!
  ) {
    DevicePushConfigRemove(
      id: $id
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
    DevicePushConfigRemove,
    'DevicePushConfigRemove',
    input,
    configs
  )
