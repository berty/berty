import { fetchQuery, graphql } from 'react-relay'
import { contact } from '../../utils'
import { merge } from '../../helpers'

const query = graphql`
  query ContactQuery($filter: BertyEntityContactInput) {
    Contact(filter: $filter) {
      id
      createdAt
      updatedAt
      sigchain
      status
      devices {
        id
        createdAt
        updatedAt
        name
        status
        apiVersion
        contactId
      }
      displayName
      displayStatus
      overrideDisplayName
      overrideDisplayStatus
      ...Contact
    }
  }
`

const defaultVariables = {
  filter: contact.default,
}

export default context => ({
  graphql: query,
  defaultVariables,
  fetch: async variables =>
    (await fetchQuery(
      context.environment,
      query,
      merge([defaultVariables, variables])
    )).Contact,
})
