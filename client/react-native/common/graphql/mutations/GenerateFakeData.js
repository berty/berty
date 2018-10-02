import { graphql } from 'react-relay'
import { commit } from '../../relay'

const GenerateFakeDataMutation = graphql`
  mutation GenerateFakeDataMutation($input: GenerateFakeDataInput!) {
    GenerateFakeData(input: $input) {
      clientMutationId
      bertyNodeVoid {
        T
      }
    }
  }
`

export default {
  commit: input => commit(GenerateFakeDataMutation, 'GenerateFakeData', input),
}
