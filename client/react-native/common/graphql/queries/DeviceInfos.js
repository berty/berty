import { fetchQuery, graphql } from 'relay-runtime'
import environment from '../../relay/environment'

const query = graphql`
  query DeviceInfosQuery($t: Bool!) {
    DeviceInfos(T: $t) {
      infos {
        key
        value
      }
    }
  }
`

export default {
  ...query,
  fetch: (variables = {}) =>
    fetchQuery(environment, query, { t: true, ...variables }),
}
