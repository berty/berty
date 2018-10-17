import { graphql, createPaginationContainer } from 'react-relay'
import { ContactList } from '../queries'

export default component =>
  createPaginationContainer(
    component,
    graphql`
      fragment ContactList on Query
        @argumentDefinitions(
          filter: { type: BertyEntityContactInput }
          count: { type: "Int32" }
          cursor: { type: "String" }
        ) {
        ContactList(
          filter: $filter
          first: $count
          after: $cursor
          orderBy: ""
          orderDesc: false
        ) @connection(key: "ContactList_ContactList") {
          edges {
            cursor
            node {
              id
              ...Contact
            }
          }
          pageInfo {
            count
            hasNextPage
            hasPreviousPage
            endCursor
            startCursor
          }
        }
      }
    `,
    {
      direction: 'forward',
      getConnectionFromProps (props) {
        return props.data.ContactList
      },
      getFragmentVariables (prevVars, totalCount) {
        return {
          ...prevVars,
          count: totalCount,
        }
      },
      getVariables (props, { count, cursor }, fragmentVariables) {
        return { count, cursor }
      },
      query: ContactList,
    }
  )
