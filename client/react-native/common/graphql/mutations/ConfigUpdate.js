import { graphql } from 'react-relay'
import { commit } from '../../relay'

const ConfigUpdateMutation = graphql`
  mutation ConfigUpdateMutation($pushRelayIdApns: [Byte!], $pushRelayIdFcm: [Byte!]) {
    ConfigUpdate(id: "", myselfId: "", currentDeviceId: "", pushRelayIdApns: $pushRelayIdApns, pushRelayIdFcm: $pushRelayIdFcm) {
      id
      createdAt
      updatedAt
      pushRelayIdApns,
      pushRelayIdFcm,
    }
  }
`

export default context => (input, configs) =>
  commit(context.environment, ConfigUpdateMutation, 'ConfigUpdate', input, configs)
