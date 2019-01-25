import { graphql } from 'react-relay'
import { commit } from '../../relay'

const ConfigUpdateMutation = graphql`
  mutation ConfigUpdateMutation($pushRelayPubkeyApns: String!, $pushRelayPubkeyFcm: String!, $notificationsEnabled: Bool!, $notificationsPreviews: Bool!, $debugNotificationVerbosity: Enum) {
    ConfigUpdate(id: "", myselfId: "", currentDeviceId: "", pushRelayPubkeyApns: $pushRelayPubkeyApns, pushRelayPubkeyFcm: $pushRelayPubkeyFcm, notificationsEnabled: $notificationsEnabled, notificationsPreviews: $notificationsPreviews, debugNotificationVerbosity: $debugNotificationVerbosity) {
      id
      createdAt
      updatedAt
      pushRelayPubkeyApns
      pushRelayPubkeyFcm
      notificationsEnabled
      notificationsPreviews
      debugNotificationVerbosity
    }
  }
`

export default context => (input, configs) =>
  commit(context.environment, ConfigUpdateMutation, 'ConfigUpdate', input, configs)
