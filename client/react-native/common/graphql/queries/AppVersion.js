import { fetchQuery, graphql } from 'relay-runtime'
import environment from '../../relay/environment'

const query = graphql`
  query AppVersionQuery($t: Bool!) {
    AppVersion(T: $t) {
      version
    }
  }
`

export default fetchQuery(environment, query, { t: true })
