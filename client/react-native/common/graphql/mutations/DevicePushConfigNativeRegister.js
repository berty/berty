import { graphql } from 'react-relay'
import { commit } from '../../relay'

const DevicePushConfigNativeRegister = graphql`
  mutation DevicePushConfigNativeRegisterMutation {
    DevicePushConfigNativeRegister(T: true) {
      T
    }
  }
`

export default context => (input, configs) =>
  commit(
    context.environment,
    DevicePushConfigNativeRegister,
    'DevicePushConfigNativeRegister',
    input,
    configs
  )
