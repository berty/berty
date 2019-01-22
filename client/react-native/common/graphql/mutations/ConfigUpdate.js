import { graphql } from 'react-relay'
import { commit } from '../../relay'

const ConfigUpdateMutation = graphql`
  mutation ConfigUpdateMutation($pushRelayPubkeyApns: String!, $pushRelayPubkeyFcm: String!) {
    ConfigUpdate(id: "", myselfId: "", currentDeviceId: "", pushRelayPubkeyApns: $pushRelayPubkeyApns, pushRelayPubkeyFcm: $pushRelayPubkeyFcm) {
      id
      createdAt
      updatedAt
      pushRelayPubkeyApns,
      pushRelayPubkeyFcm,
    }
  }
`

export default context => (input, configs) =>
  commit(context.environment, ConfigUpdateMutation, 'ConfigUpdate', input, configs)
