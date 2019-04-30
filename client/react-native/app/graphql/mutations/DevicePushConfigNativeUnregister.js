import { graphql } from 'react-relay'
import { commit } from '../../relay'

const DevicePushConfigNativeUnregister = graphql`
  mutation DevicePushConfigNativeUnregisterMutation {
    DevicePushConfigNativeUnregister(T: true) {
      T
    }
  }
`

export default context => (input, configs) =>
  commit(
    context.environment,
    DevicePushConfigNativeUnregister,
    'DevicePushConfigNativeUnregister',
    input,
    configs
  )
