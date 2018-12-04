import { fetchQuery, graphql } from 'react-relay'

import { merge } from '../../helpers'

const query = graphql`
  query ConversationQuery($id: ID!) {
    GetConversation(id: $id) {
      id
      ...Conversation
    }
  }
`

const defaultVariables = {
  id: '',
}

export default context => ({
  graphql: query,
  defaultVariables,
  fetch: async variables =>
    (await fetchQuery(
      context.environment,
      query,
      merge([defaultVariables, variables])
    )).GetConversation,
})
