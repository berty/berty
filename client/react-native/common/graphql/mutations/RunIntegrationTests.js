import { graphql } from 'react-relay'
import { commit } from '../../relay'

const RunIntegrationTestsMutation = graphql`
  mutation RunIntegrationTestsMutation(
  $name: String!
  ) {
    RunIntegrationTests(name: $name) {
      name
      success
      verbose
      startedAt
      finishedAt
    }
  }
`

export default {
  commit: input =>
    commit(RunIntegrationTestsMutation, 'RunIntegrationTests', input),
}
