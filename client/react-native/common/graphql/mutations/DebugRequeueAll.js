import { graphql } from 'react-relay'

import { commit } from '../../relay'

const DebugRequeueAllMutation = graphql`
  mutation DebugRequeueAllMutation($t: Bool!) {
    DebugRequeueAll(T: $t) {
      T
    }
  }
`

export default {
  commit: (input, configs) => commit(DebugRequeueAllMutation, 'DebugRequeueAll', input, configs),
}
