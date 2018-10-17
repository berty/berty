import { graphql } from 'react-relay'

export default graphql`
  query ContactQuery($filter: BertyEntityContactInput) {
    ContactList(
      filter: $filter
      first: 1
      after: ""
      orderBy: ""
      orderDesc: false
    ) {
      edges {
        node {
          ...Contact
        }
      }
    }
  }
`
