import { fetchQuery, graphql } from 'react-relay'

import { merge } from '../../helpers'

const query = graphql`
  query ConversationQuery($id: ID!) {
    ConversationList(id: $id) {
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
  fetch: variables =>
    fetchQuery(
      context.environment,
      query,
      merge([defaultVariables, variables])
    ),
})
