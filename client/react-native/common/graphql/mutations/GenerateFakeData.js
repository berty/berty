import { graphql } from 'react-relay'
import { commit } from '../../relay'

const GenerateFakeDataMutation = graphql`
  mutation GenerateFakeDataMutation($t: Bool!) {
    GenerateFakeData(T: $t) {
      T
    }
  }
`

export default context => (input, configs) =>
  commit(
    context.environment,
    GenerateFakeDataMutation,
    'GenerateFakeData',
    input,
    configs
  )
