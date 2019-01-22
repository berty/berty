import { fetchQuery, graphql } from 'react-relay'

import { merge } from '../../helpers'

const query = graphql`
  query DevicePushConfigListQuery($t: Bool!) {
    DevicePushConfigList(T: $t) {
      edges {
        id
        createdAt
        updatedAt
        pushType
        pushId
        relayPubkey
      }
    }
  }
`
const defaultVariables = {
  t: true,
}

export default context => ({
  graphql: query,
  defaultVariables,
  fetch: async variables =>
    (await fetchQuery(
      context.environment,
      query,
      merge([defaultVariables, variables])
    )).DevicePushConfigList,
})
