import { fetchQuery, graphql } from 'react-relay'
import { contact } from '../../utils'
import { merge } from '../../helpers'

const query = graphql`
  query ContactQuery($filter: BertyEntityContact) {
    Contact(filter: $filter) {
      id
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
