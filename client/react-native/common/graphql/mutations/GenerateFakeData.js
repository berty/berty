import { graphql } from 'react-relay'
import { commit } from '../../relay'

const GenerateFakeDataMutation = graphql`
  mutation GenerateFakeDataMutation($t: Bool!) {
    GenerateFakeData(T: $t) {
      T
    }
  }
`

export default {
  commit: (input, configs) => commit(GenerateFakeDataMutation, 'GenerateFakeData', input, configs),
}
