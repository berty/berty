import { graphql } from 'react-relay'

import { commit } from '../../relay'

const DebugRequeueAllMutation = graphql`
  mutation DebugRequeueAllMutation($t: Bool!) {
    DebugRequeueAll(T: $t) {
      T
    }
  }
`

export default context => (input, configs) =>
  commit(
    context.environment,
    DebugRequeueAllMutation,
    'DebugRequeueAll',
    input,
    configs
  )
