import { fetchQuery, graphql } from 'react-relay'

const query = graphql`
  query GetTagInfoQuery($str: String!) {
    GetTagInfo(str: $str) {
      ret
    }
  }
`

const t = async (context, query, variables) => {
  console.log(variables)
  return fetchQuery(context.environment, query, variables)
}

export default context => ({
  graphql: query,
  fetch: async variables =>
    (await t(context, query, variables)).GetTagInfo,
})
